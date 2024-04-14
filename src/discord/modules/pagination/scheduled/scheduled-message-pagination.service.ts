import { Injectable, Logger } from '@nestjs/common';
import { BasePaginationHandler } from '../base-pagination-handler';
import { ScheduledMessageEntity } from '../../commands/schedule/message/entities/scheduled-message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbedsService } from '../../embeds/embeds.service';
import { ActionLoggerService } from '../../action-logger/action-logger.service';
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

@Injectable()
export class ScheduledMessagePaginationService extends BasePaginationHandler<ScheduledMessageEntity> {
  private currentPage = 1;
  private totalPages: number = 0;
  private presets: ScheduledMessageEntity[] = [];
  private readonly logger = new Logger(ScheduledMessagePaginationService.name);

  constructor(
    @InjectRepository(ScheduledMessageEntity)
    private readonly scheduledMessageEntityRepository: Repository<ScheduledMessageEntity>,
    private readonly embedsService: EmbedsService,
    private readonly actionLoggerService: ActionLoggerService,
  ) {
    super(1);
  }

  public async showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const guildId = interaction.guildId;

    if (!guildId) return;

    this.presets = await this.scheduledMessageEntityRepository.find({
      where: { guild: { guildId: guildId } },
      relations: ['guild'],
    });

    this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

    if (this.totalPages === 0) {
      await this.updateEmbedOnEmptyRecords({
        reason: 'request',
        interaction,
        title: 'No one scheduled messages',
        embed: this.embedsService.getAddEmbed(),
      });
      return Promise.resolve();
    }

    const pageInfo = this.getPageInfo(this.currentPage);
    const embed = this.embedsService.getAddEmbed();
    embed
      .setTitle('Scheduled message')
      .addFields({
        name: 'Author',
        value: `<@${pageInfo.pageData.authorId}>`,
        inline: true,
      })
      .addFields({
        name: 'Channel',
        value: `<#${pageInfo.pageData.channelId}>`,
        inline: true,
      })
      .addFields({ name: 'Date', value: pageInfo.pageData.readableDate })
      .addFields({
        name: 'Attachment',
        value: pageInfo.pageData.attachmentUrl || '-',
      })
      .addFields({ name: 'Gif', value: pageInfo.pageData.gifUrl || '-' })
      .addFields({
        name: 'Message',
        value: pageInfo.pageData.message || '-',
      })
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
        await this.deleteScheduledMessage(interaction, embed, btnInteraction);
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
      {
        name: 'Author',
        value: `<@${pageInfo.pageData.authorId}>`,
        inline: true,
      },
      {
        name: 'Channel',
        value: `<#${pageInfo.pageData.channelId}>`,
        inline: true,
      },
      { name: 'Date', value: pageInfo.pageData.readableDate },
      {
        name: 'Attachment',
        value: pageInfo.pageData.attachmentUrl || '-',
      },
      { name: 'Gif', value: pageInfo.pageData.gifUrl || '-' },
      {
        name: 'Message',
        value: pageInfo.pageData.message || '-',
      },
      {
        name: ' ',
        value: `Page ${this.currentPage}/${this.totalPages}`,
      },
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

    return {
      pageData,
    };
  }

  private async deleteScheduledMessage(
    interaction: ChatInputCommandInteraction<CacheType>,
    embed: EmbedBuilder,
    btnInteraction: ButtonInteraction<CacheType>,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const pageDeletedInfo = this.getPageInfo(this.currentPage);
      await this.scheduledMessageEntityRepository.delete({
        scheduleMessageId: pageDeletedInfo.pageData.scheduleMessageId,
      });

      await this.actionLoggerService.scheduleMessageRemove({
        guildId: pageDeletedInfo.pageData.guild.guildId,
        author: interaction.user,
        readableDate: pageDeletedInfo.pageData.readableDate,
        channelId: pageDeletedInfo.pageData.channelId,
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

      this.presets = await this.scheduledMessageEntityRepository.find({
        where: { guild: { guildId: guildId } },
        relations: ['guild'],
      });
      this.totalPages = this.getTotalPages(this.presets, this.itemsPerPage);

      if (this.totalPages === 0) {
        await this.updateEmbedOnEmptyRecords({
          reason: 'delete',
          btnInteraction,
          title: 'No one scheduled messages',
          embed: this.embedsService.getAddEmbed(),
        });
        return Promise.resolve();
      }

      await this.updateEmbedOnBtnClick(embed, btnInteraction);
      return Promise.resolve();
    } catch (e) {
      this.logger.error(`Scheduled Message Delete ${guildId}: ${e}`);
    }
  }
}
