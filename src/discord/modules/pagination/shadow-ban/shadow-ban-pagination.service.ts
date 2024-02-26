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
    this.presets = await this.shadowBanRepository.find({
      where: { guild: { guildId: interaction.guildId } },
      relations: ['guild'],
    });
    this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

    if (this.totalPages === 0) {
      await this.updateEmbedOnEmptyRecords({
        reason: 'request',
        interaction,
        title: 'No one user in shadow ban',
        embed: this.embedsService.getAddEmbed(),
      });
      return Promise.resolve();
    }

    const pageInfo = this.getPageInfo(this.currentPage);
    const embed = this.embedsService.getAddEmbed();
    embed
      .setTitle('Shadow ban settings')
      .addFields({ name: 'Name', value: pageInfo.pageData.name })
      .addFields({ name: 'User', value: pageInfo.user })
      .addFields({ name: 'Channel', value: pageInfo.channel })
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
    const collector = this.getCollector(reply, interaction);

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.customId === ButtonIds.list_prev) {
        this.currentPage -= 1;
        await this.updateEmbedOnBtnClick(embed, btnInteraction);
      }

      if (btnInteraction.customId === ButtonIds.list_next) {
        this.currentPage += 1;
        await this.updateEmbedOnBtnClick(embed, btnInteraction);
      }

      if (btnInteraction.customId === ButtonIds.list_delete) {
        await this.deleteShadowBanSettings(interaction, embed, btnInteraction);
      }

      collector.stop('btnClick');
      await this.handleButtons(interaction, reply, embed);
    });

    collector.on('end', async (collected, reason) => {
      if (reason !== 'btnClick') {
        await interaction.deleteReply();
      }
    });
    return Promise.resolve();
  }

  protected async updateEmbedOnBtnClick(
    embed: EmbedBuilder,
    btnInteraction: ButtonInteraction<CacheType>,
  ) {
    const pageInfo = this.getPageInfo(this.currentPage);
    embed.setFields(
      { name: 'Name', value: pageInfo.pageData.name },
      { name: 'User', value: pageInfo.user },
      { name: 'Channel', value: pageInfo.channel },
      { name: ' ', value: `Page ${this.currentPage}/${this.totalPages}` },
    );
    await btnInteraction.update({
      embeds: [embed],
      components: [this.createActionRow(this.currentPage, this.totalPages)],
    });
  }

  private getPageInfo(pageNumber: number) {
    const startIndex = (pageNumber - 1) * this.itemsPerPage;
    const pageData = this.presets.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    )[0];

    const channel =
      pageData.channelIds.length > 0
        ? pageData.channelIds.map((item) => `<#${item}>`).join(' ')
        : 'All channels';
    const user =
      pageData.userIds.length > 0
        ? pageData.userIds.map((userId) => `<@${userId}>`).join(' ')
        : 'All users';

    return {
      pageData,
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
      const pageDeletedInfo = this.getPageInfo(this.currentPage);
      await this.shadowBanRepository.delete({
        banId: pageDeletedInfo.pageData.banId,
      });

      await this.actionLoggerService.shadowBanRemove({
        name: pageDeletedInfo.pageData.name,
        channelIds: pageDeletedInfo.pageData.channelIds,
        bannedUsersIds: pageDeletedInfo.pageData.userIds,
        guildId: pageDeletedInfo.pageData.guild.guildId,
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

      this.presets = await this.shadowBanRepository.find({
        where: { guild: { guildId: interaction.guildId } },
        relations: ['guild'],
      });
      this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

      if (this.totalPages === 0) {
        await this.updateEmbedOnEmptyRecords({
          reason: 'delete',
          btnInteraction,
          title: 'No one user in shadow ban',
          embed: this.embedsService.getAddEmbed(),
        });
        return Promise.resolve();
      }

      await this.updateEmbedOnBtnClick(embed, btnInteraction);
      return Promise.resolve();
    } catch (e) {
      this.logger.error(`Shadow ban delete ${interaction.guildId}: ${e}`);
    }
  }
}
