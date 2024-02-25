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

export abstract class BasePaginationHandler<T> {
  protected itemsPerPage: number;

  protected constructor(itemsPerPage: number) {
    this.itemsPerPage = itemsPerPage;
  }

  protected abstract paginateArray(
    array: T[],
    pageSize: number,
    pageNumber: number,
  ): T;

  protected abstract createActionRow(
    currentPage: number,
    totalPages: number,
  ): ActionRowBuilder<ButtonBuilder>;

  protected abstract handleButtons(
    interaction: ChatInputCommandInteraction<CacheType>,
    reply: InteractionResponse<boolean>,
    embed: EmbedBuilder,
  ): Promise<void>;

  public abstract showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void>;

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
