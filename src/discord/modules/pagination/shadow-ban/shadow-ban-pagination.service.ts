import { BasePaginationHandler } from '../base-pagination-handler';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
} from 'discord.js';
import { ButtonIds } from '../enums/button-ids.enum';
import { ShadowBanEntity } from '../../commands/shadow-ban/entities/shadow-ban.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbedsService } from '../../embeds/embeds.service';
import { Injectable, Logger } from '@nestjs/common';
import { ActionLoggerService } from '../../action-logger/action-logger.service';

@Injectable()
export class ShadowBanPaginationService extends BasePaginationHandler<ShadowBanEntity> {
  private currentPage = 1;
  private totalPages: number = 0;
  private presets: ShadowBanEntity[] = [];
  private readonly logger = new Logger(ShadowBanPaginationService.name);

  constructor(
    @InjectRepository(ShadowBanEntity)
    private readonly shadowBanRepository: Repository<ShadowBanEntity>,
    private readonly embedsService: EmbedsService,
    private readonly actionLoggerService: ActionLoggerService,
  ) {
    super(1);
  }

  public async showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const shadowBan = await this.shadowBanRepository.find({
      where: { guild: { guildId: interaction.guildId } },
      relations: ['guild'],
    });

    const embed = this.embedsService.getAddEmbed();
    this.presets = shadowBan;
    this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

    if (this.totalPages === 0) {
      embed.setTitle('No one user in shadow ban');
      await interaction.reply({ ephemeral: true, embeds: [embed] });
      return Promise.resolve();
    }

    const embedInfo = this.getEmbedInfo(this.currentPage);
    embed
      .setTitle('Shadow ban settings')
      .addFields({ name: 'Name', value: embedInfo.presetInfo.name })
      .addFields({ name: 'User', value: embedInfo.user })
      .addFields({ name: 'Channel', value: embedInfo.channel })
      .addFields({
        name: ' ',
        value: `Page ${this.currentPage}/${this.totalPages}`,
      });

    const reply = await interaction.reply({
      ephemeral: true,
      embeds: [embed],
      components: [this.createActionRow(this.currentPage, this.totalPages)],
    });
    await this.handleButtons(interaction, reply, embed);
    return Promise.resolve();
  }

  protected paginateArray(
    array: ShadowBanEntity[],
    pageSize: number,
    pageNumber: number,
  ): ShadowBanEntity {
    const startIndex = (pageNumber - 1) * pageSize;
    const pageArray = array.slice(startIndex, startIndex + pageSize)[0];
    return pageArray;
  }

  protected createActionRow(
    currentPage: number,
    totalPages: number,
  ): ActionRowBuilder<ButtonBuilder> {
    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(ButtonIds.list_prev)
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1 || currentPage === 0),
      new ButtonBuilder()
        .setCustomId(ButtonIds.list_next)
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages || currentPage === 0),
      new ButtonBuilder()
        .setCustomId(ButtonIds.list_delete)
        .setLabel('Delete')
        .setEmoji('⚠️')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(currentPage === 0),
    );

    return btnRow;
  }

  protected handleButtons(
    interaction: ChatInputCommandInteraction<CacheType>,
    reply: InteractionResponse<boolean>,
    embed: EmbedBuilder,
  ): Promise<void> {
    this.createCollector(reply, interaction, embed);
    return Promise.resolve();
  }

  private createCollector(
    reply: InteractionResponse<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>,
    embed: EmbedBuilder,
  ) {
    const collector = this.getCollector(reply, interaction);

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.customId === ButtonIds.list_prev) {
        this.currentPage -= 1;
        await this.updateEmbed(embed, btnInteraction);
      }

      if (btnInteraction.customId === ButtonIds.list_next) {
        this.currentPage += 1;
        await this.updateEmbed(embed, btnInteraction);
      }

      if (btnInteraction.customId === ButtonIds.list_delete) {
        await this.deleteShadowBanSettings(interaction, embed, btnInteraction);
      }

      collector.stop('btnClick');
      this.createCollector(reply, interaction, embed);
    });

    collector.on('end', async (collected, reason) => {
      if (reason !== 'btnClick') {
        await interaction.deleteReply();
      }
    });
  }

  protected async updateEmbed(
    embed: EmbedBuilder,
    btnInteraction: ButtonInteraction<CacheType>,
  ) {
    const embedInfo = this.getEmbedInfo(this.currentPage);
    embed.setFields(
      { name: 'Name', value: embedInfo.presetInfo.name },
      { name: 'User', value: embedInfo.user },
      { name: 'Channel', value: embedInfo.channel },
      { name: ' ', value: `Page ${this.currentPage}/${this.totalPages}` },
    );
    await btnInteraction.update({
      embeds: [embed],
      components: [this.createActionRow(this.currentPage, this.totalPages)],
    });
  }

  private getEmbedInfo(pageNumber: number) {
    const presetInfo = this.paginateArray(
      this.presets,
      this.itemsPerPage,
      pageNumber,
    );
    const channel =
      presetInfo.channelIds.length > 0
        ? presetInfo.channelIds.map((item) => `<#${item}>`).join(' ')
        : 'All channels';
    const user =
      presetInfo.userIds.length > 0
        ? presetInfo.userIds.map((userId) => `<@${userId}>`).join(' ')
        : 'All users';

    return {
      presetInfo,
      channel,
      user,
    };
  }

  private async deleteShadowBanSettings(
    interaction: ChatInputCommandInteraction<CacheType>,
    embed: EmbedBuilder,
    btnInteraction: ButtonInteraction<CacheType>,
  ) {
    try {
      const embedDeletedInfo = this.getEmbedInfo(this.currentPage);
      await this.shadowBanRepository.delete({
        banId: embedDeletedInfo.presetInfo.banId,
      });

      await this.actionLoggerService.shadowBanRemove({
        name: embedDeletedInfo.presetInfo.name,
        channelIds: embedDeletedInfo.presetInfo.channelIds,
        bannedUsersIds: embedDeletedInfo.presetInfo.userIds,
        guildId: embedDeletedInfo.presetInfo.guild.guildId,
        author: interaction.user,
      });

      const isOnePage =
        this.currentPage === 1 && this.totalPages === this.currentPage;
      const isDeleteNotFirst = this.currentPage !== 1 && this.totalPages !== 1;
      const isDeleteFirst =
        this.currentPage === 1 && this.totalPages !== this.currentPage;

      if (isOnePage || isDeleteNotFirst) {
        this.currentPage -= 1;
      }

      if (isDeleteFirst) {
        this.currentPage = 1;
      }

      const shadowBan = await this.shadowBanRepository.find({
        where: { guild: { guildId: interaction.guildId } },
        relations: ['guild'],
      });

      this.presets = shadowBan;
      this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);
      if (this.totalPages === 0) {
        const baseEmbed = this.embedsService.getAddEmbed();
        baseEmbed.setTitle('No one user in shadow ban');
        await btnInteraction.update({ embeds: [baseEmbed], components: [] });
        return Promise.resolve();
      }

      await this.updateEmbed(embed, btnInteraction);
      return Promise.resolve();
    } catch (e) {
      this.logger.error(`Shadow ban delete ${interaction.guildId}: ${e}`);
    }
  }
}
