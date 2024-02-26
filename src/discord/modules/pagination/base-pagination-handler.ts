import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  InteractionResponse,
} from 'discord.js';
import { UpdateEmbedOnEmptyRecordsType } from './types/update-embed-on-empty-records.type';

export abstract class BasePaginationHandler<T> {
  protected itemsPerPage: number;

  protected constructor(itemsPerPage: number) {
    this.itemsPerPage = itemsPerPage;
  }

  public abstract showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void>;

  protected abstract createActionRow(
    currentPage: number,
    totalPages: number,
  ): ActionRowBuilder<ButtonBuilder>;

  protected abstract handleButtons(
    interaction: ChatInputCommandInteraction<CacheType>,
    reply: InteractionResponse<boolean>,
    embed: EmbedBuilder,
  ): Promise<void>;

  protected abstract updateEmbedOnBtnClick(
    embed: EmbedBuilder,
    btnInteraction: ButtonInteraction<CacheType>,
  ): Promise<void>;

  protected async updateEmbedOnEmptyRecords({
    interaction,
    btnInteraction,
    reason,
    title,
    embed,
  }: UpdateEmbedOnEmptyRecordsType): Promise<void> {
    embed.setTitle(title);

    if (reason === 'delete' && btnInteraction) {
      await btnInteraction.update({ embeds: [embed], components: [] });
      return Promise.resolve();
    }

    if (reason === 'request' && interaction) {
      await interaction.reply({ ephemeral: true, embeds: [embed] });
      return Promise.resolve();
    }
  }

  protected getTotalPages(array: T[], pageSize: number): number {
    return Math.ceil(array.length / pageSize);
  }

  protected getCollector(
    reply: InteractionResponse<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    return reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i: ButtonInteraction<CacheType>) =>
        i.user.id === interaction.user.id,
      time: 60000,
    });
  }
}
