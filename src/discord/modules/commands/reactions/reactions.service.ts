import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { PermissionFlagsBits } from 'discord.js';
import { ReactionsDto } from './dto/reactions.dto';
import { UtilsService } from '../../utils/utils.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionsEntity } from './entities/reactions.entity';
import { ActionLoggerService } from '../../action-logger/action-logger.service';
import { ReactionsPaginationService } from '../../pagination/reactions/reactions-pagination.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ReactionsService {
  private readonly logger = new Logger(ReactionsService.name);

  constructor(
    private readonly utilService: UtilsService,
    @InjectRepository(ReactionsEntity)
    private readonly reactionsEntityRepository: Repository<ReactionsEntity>,
    private readonly actionLoggerService: ActionLoggerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @SlashCommand({
    name: 'reactions-add',
    description: 'Set up reactions',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onReactionsAdd(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: ReactionsDto,
  ) {
    try {
      const channelIds = dto.channels
        ? this.utilService.getChannelIds(dto.channels, interaction)
        : [];
      const userIds = dto.users
        ? this.utilService.getUserIds(dto.users, interaction)
        : [];
      const emojiIds = this.utilService.getEmojiIds(dto.emoji, interaction);

      if (await this.isNameTaken(dto.name)) {
        await interaction.reply({
          content: `Unable to add reactions. The name **${dto.name}** is already taken`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      if (emojiIds.length === 0) {
        await interaction.reply({
          content: `Unable to add reactions. You have to enter at least one emoji`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      await this.reactionsEntityRepository.save({
        name: dto.name,
        channelIds: channelIds,
        userIds: userIds,
        emojis: emojiIds,
        guild: { guildId: interaction.guildId },
      });

      await interaction.reply({
        content: `You have successfully added reactions with name **${dto.name}**`,
        ephemeral: true,
      });

      await this.actionLoggerService.reactionsAdd({
        guildId: interaction.guildId,
        name: dto.name,
        emojis: emojiIds,
        userIds: userIds,
        channelIds: channelIds,
        author: interaction.user,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong with adding reactions. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Reactions add ${interaction.guildId}: ${e}`);
    }
  }

  @SlashCommand({
    name: 'reactions-list',
    description: 'Show all reaction list',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onReactionsList(@Context() [interaction]: SlashCommandContext) {
    const reactionsPaginationService = await this.moduleRef.create(
      ReactionsPaginationService,
    );
    await reactionsPaginationService.showList(interaction);
  }

  private async isNameTaken(name: string) {
    const reactions = await this.reactionsEntityRepository.findOne({
      where: { name: name },
    });

    return reactions !== null;
  }
}
