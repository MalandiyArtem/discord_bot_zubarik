import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { PermissionFlagsBits } from 'discord.js';
import { ShadowBanDto } from './dto/shadow-ban.dto';
import { UtilsService } from '../../utils/utils.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShadowBanEntity } from './entities/shadow-ban.entity';
import { ActionLoggerService } from '../../action-logger/action-logger.service';
import { ShadowBanPaginationService } from '../../pagination/shadow-ban/shadow-ban-pagination.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ShadowBanService {
  private readonly logger = new Logger(ShadowBanService.name);

  constructor(
    private readonly utilService: UtilsService,
    @InjectRepository(ShadowBanEntity)
    private readonly shadowBanRepository: Repository<ShadowBanEntity>,
    private readonly actionLoggerService: ActionLoggerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @SlashCommand({
    name: 'shadow-ban',
    description: 'Shadow ban for user (every his message will be deleted)',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onShadowBan(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: ShadowBanDto,
  ) {
    try {
      const channelIds = dto.channels
        ? this.utilService.getChannelIds(dto.channels, interaction)
        : [];
      const userIds = dto.users
        ? this.utilService.getUserIds(dto.users, interaction)
        : [];

      if (userIds.length === 0) {
        await interaction.reply({
          content:
            'You have to add at least one user. Please use @ to add user',
        });
        return Promise.resolve();
      }

      if (await this.isNameTaken(dto.name)) {
        await interaction.reply({
          content: `Unable to add user to shadow ban. The name **${dto.name}** is already taken`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      await this.shadowBanRepository.save({
        name: dto.name,
        channelIds: channelIds,
        userIds: userIds,
        guild: { guildId: interaction.guildId },
      });

      await interaction.reply({
        content: 'You successfully added user(s) to shadow ban list',
        ephemeral: true,
      });

      await this.actionLoggerService.shadowBanAdd({
        guildId: interaction.guildId,
        bannedUsersIds: userIds,
        channelIds: channelIds,
        author: interaction.user,
        name: dto.name,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong with adding user to shadow ban. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Shadow ban add ${interaction.guildId}: ${e}`);
    }
  }

  @SlashCommand({
    name: 'shadow-ban-list',
    description: 'Display list of shadow bans',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onShadowBanList(@Context() [interaction]: SlashCommandContext) {
    const shadowBanPaginationService = await this.moduleRef.create(
      ShadowBanPaginationService,
    );
    await shadowBanPaginationService.showList(interaction);
  }

  private async isNameTaken(name: string) {
    const shadowBan = await this.shadowBanRepository.findOne({
      where: { name: name },
    });

    return shadowBan !== null;
  }
}
