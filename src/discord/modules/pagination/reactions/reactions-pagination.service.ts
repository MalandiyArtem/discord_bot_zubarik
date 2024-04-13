import { BasePaginationHandler } from '../base-pagination-handler';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  InteractionResponse,
} from 'discord.js';
import { ButtonIds } from '../enums/button-ids.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbedsService } from '../../embeds/embeds.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ActionLoggerService } from '../../action-logger/action-logger.service';
import { ReactionsEntity } from '../../commands/reactions/entities/reactions.entity';
import { CACHE_KEYS } from '../../../../constants/cache';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ReactionsPaginationService extends BasePaginationHandler<ReactionsEntity> {
  private currentPage = 1;
  private totalPages: number = 0;
  private presets: ReactionsEntity[] = [];
  private readonly logger = new Logger(ReactionsPaginationService.name);

  constructor(
    @InjectRepository(ReactionsEntity)
    private readonly reactionsEntityRepository: Repository<ReactionsEntity>,
    private readonly embedsService: EmbedsService,
    private readonly actionLoggerService: ActionLoggerService,
    private readonly client: Client,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(1);
  }

  public async showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    this.presets = await this.reactionsEntityRepository.find({
      where: { guild: { guildId: interaction.guildId } },
      relations: ['guild'],
    });
    this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

    if (this.totalPages === 0) {
      await this.updateEmbedOnEmptyRecords({
        reason: 'request',
        interaction,
        title: 'No one registered reactions',
        embed: this.embedsService.getAddEmbed(),
      });
      return Promise.resolve();
    }

    const pageInfo = this.getPageInfo(this.currentPage);
    const embed = this.embedsService.getAddEmbed();
    const emojis = pageInfo.pageData.emojis
      .map((emojiId) => `${this.client.emojis.cache.get(emojiId) || emojiId}`)
      .join(' ');

    embed
      .setTitle('Reactions')
      .addFields({ name: 'Name', value: pageInfo.pageData.name })
      .addFields({ name: 'Emoji', value: emojis })
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
        await this.deleteReactions(interaction, embed, btnInteraction);
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
    const emojis = pageInfo.pageData.emojis
      .map((emojiId) => `${this.client.emojis.cache.get(emojiId) || emojiId}`)
      .join(' ');

    embed.setFields(
      { name: 'Name', value: pageInfo.pageData.name },
      { name: 'Emoji', value: emojis },
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

  private async deleteReactions(
    interaction: ChatInputCommandInteraction<CacheType>,
    embed: EmbedBuilder,
    btnInteraction: ButtonInteraction<CacheType>,
  ) {
    try {
      const pageDeletedInfo = this.getPageInfo(this.currentPage);
      await this.reactionsEntityRepository.delete({
        id: pageDeletedInfo.pageData.id,
      });

      await this.clearReactionsCache(interaction.guildId);

      await this.actionLoggerService.reactionsRemove({
        guildId: interaction.guildId,
        name: pageDeletedInfo.pageData.name,
        emojis: pageDeletedInfo.pageData.emojis,
        userIds: pageDeletedInfo.pageData.userIds,
        channelIds: pageDeletedInfo.pageData.channelIds,
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

      this.presets = await this.reactionsEntityRepository.find({
        where: { guild: { guildId: interaction.guildId } },
        relations: ['guild'],
      });
      this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

      if (this.totalPages === 0) {
        await this.updateEmbedOnEmptyRecords({
          reason: 'delete',
          btnInteraction,
          title: 'No one registered reactions',
          embed: this.embedsService.getAddEmbed(),
        });
        return Promise.resolve();
      }

      await this.updateEmbedOnBtnClick(embed, btnInteraction);
      return Promise.resolve();
    } catch (e) {
      this.logger.error(`Reactions delete ${interaction.guildId}: ${e}`);
    }
  }

  private async clearReactionsCache(guildId: string) {
    await this.cacheManager.del(
      CACHE_KEYS.REACTIONS.key.replace('{guildId}', guildId),
    );
  }
}
