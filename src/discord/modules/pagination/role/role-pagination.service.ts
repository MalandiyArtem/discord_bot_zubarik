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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbedsService } from '../../embeds/embeds.service';
import { Injectable } from '@nestjs/common';
import { RolesEntity } from '../../commands/roles/entities/roles.entity';

@Injectable()
export class RolePaginationService extends BasePaginationHandler<string> {
  private currentPage = 1;
  private totalPages: number = 0;
  private availableRoles: string[] = [];

  constructor(
    @InjectRepository(RolesEntity)
    private readonly rolesEntityRepository: Repository<RolesEntity>,
    private readonly embedsService: EmbedsService,
  ) {
    super(5);
  }

  public async showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const roles = await this.rolesEntityRepository.find({
      where: { guild: { guildId: interaction.guildId } },
    });

    this.availableRoles = roles.map((role) => role.roleId);
    this.totalPages = this.getTotalPages(
      this.availableRoles,
      this.itemsPerPage,
    );

    if (this.totalPages === 0) {
      await this.updateEmbedOnEmptyRecords({
        reason: 'request',
        interaction,
        title: 'No one role is available',
        embed: this.embedsService.getAddEmbed(),
      });
      return Promise.resolve();
    }

    const pageInfo = this.getPageInfo(this.currentPage);
    const embed = this.embedsService.getAddEmbed();
    embed
      .setTitle('Roles which available to pickup or get rid')
      .addFields({ name: ' ', value: `${pageInfo}` })
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
        name: ' ',
        value: `${pageInfo}`,
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
    const pageData = this.availableRoles.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );

    const numberedPageArray = pageData.map((roleId, index) => {
      const overallIndex = startIndex + index + 1;
      return `${overallIndex}. <@&${roleId}>`;
    });

    return numberedPageArray.join('\n');
  }
}
