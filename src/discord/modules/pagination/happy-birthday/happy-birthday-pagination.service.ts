import { Injectable } from '@nestjs/common';
import { BasePaginationHandler } from '../base-pagination-handler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbedsService } from '../../embeds/embeds.service';
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
import { HappyBirthdayConfigurationEntity } from '../../commands/happy-birthday/entities/happy-birthday-configuration.entity';
import { HappyBirthdayEntity } from '../../commands/happy-birthday/entities/happy-birthday.entity';

interface HappyBirthdayItem {
  id: number;
  username: string;
  userId: string;
  shortDate: string;
}

@Injectable()
export class HappyBirthdayPaginationService extends BasePaginationHandler<HappyBirthdayItem> {
  private currentPage = 1;
  private totalPages: number = 0;
  private happyBirthdays: HappyBirthdayItem[] = [];

  constructor(
    @InjectRepository(HappyBirthdayConfigurationEntity)
    private readonly happyBirthdayConfigurationRepository: Repository<HappyBirthdayConfigurationEntity>,
    @InjectRepository(HappyBirthdayEntity)
    private readonly happyBirthdayRepository: Repository<HappyBirthdayEntity>,
    private readonly embedsService: EmbedsService,
  ) {
    super(10);
  }

  public async showList(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const guildId = interaction.guildId;

    if (!guildId) return;

    const happyBirthdayConfiguration =
      await this.happyBirthdayConfigurationRepository.findOne({
        where: {
          guild: {
            guildId: guildId,
          },
        },
      });

    if (!happyBirthdayConfiguration) return;

    const happyBirthdays = await this.happyBirthdayRepository.find({
      where: {
        happyBirthdayConfiguration: {
          configurationId: happyBirthdayConfiguration.configurationId,
        },
      },
    });

    const sortedBirthdays = happyBirthdays.sort((a, b) => {
      const [dayA, monthA] = a.shortDate.split('.').map(Number);
      const [dayB, monthB] = b.shortDate.split('.').map(Number);

      return monthA - monthB || dayA - dayB;
    });

    this.happyBirthdays = sortedBirthdays.map((item) => ({
      shortDate: item.shortDate,
      id: item.happyBirthdayId,
      userId: item.userId,
      username: item.username,
    }));

    this.totalPages = this.getTotalPages(
      this.happyBirthdays,
      this.itemsPerPage,
    );

    if (this.totalPages === 0) {
      await this.updateEmbedOnEmptyRecords({
        reason: 'request',
        interaction,
        title: 'No one happy birthday is available',
        embed: this.embedsService.getAddEmbed(),
      });
      return Promise.resolve();
    }

    const pageInfo = this.getPageInfo(this.currentPage);
    const embed = this.embedsService.getAddEmbed();
    embed
      .setTitle('Happy birthday list')
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
    const pageData = this.happyBirthdays.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );

    const numberedPageArray = pageData.map((item) => {
      return `ID: ${item.id} \n **${item.shortDate}** — <@${item.userId}> (**${item.username}**) \n`;
    });

    return numberedPageArray.join('\n');
  }
}
