import { Injectable, Logger } from '@nestjs/common';
import { Client, TextChannel, User } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { Repository } from 'typeorm';
import { EmbedsService } from '../embeds/embeds.service';
import { ShadowBanLogParams } from './types/shadow-ban-add-params';
import {
  RoleAddParams,
  RoleRemoveAllParams,
  RoleRemoveParams,
} from './types/role-params';

@Injectable()
export class ActionLoggerService {
  private readonly logger = new Logger(ActionLoggerService.name);

  constructor(
    private readonly client: Client,
    @InjectRepository(GuildsEntity)
    private readonly guildRepository: Repository<GuildsEntity>,
    private readonly embedsService: EmbedsService,
  ) {}

  public async addLogChannel(guildId: string, author: User) {
    try {
      const logChannel = await this.getLogChannel(guildId);
      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Log channel updated')
        .setThumbnail(author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Log channel has been added by <@${author?.id}>`,
        })
        .addFields({
          name: 'New log channel',
          value: `<#${logChannel.id}>`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Log add log channel ${guildId}: ${e}`);
    }
  }

  public async shadowBanAdd(options: ShadowBanLogParams) {
    try {
      const channels =
        options.channelIds.length > 0
          ? options.channelIds.map((item) => `<#${item}>`).join(' ')
          : 'All channels';
      const users =
        options.bannedUsersIds.length > 0
          ? options.bannedUsersIds.map((userId) => `<@${userId}>`).join(' ')
          : 'All users';

      const logChannel = await this.getLogChannel(options.guildId);
      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Shadow ban list has been updated')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Shadow ban list has been updated by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Name', value: options.name })
        .addFields({ name: 'User', value: users })
        .addFields({ name: 'Channel', value: channels });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Shadow Ban Add ${options.guildId}: ${e}`);
    }
  }

  public async shadowBanRemove(options: ShadowBanLogParams) {
    try {
      const channels =
        options.channelIds.length > 0
          ? options.channelIds.map((item) => `<#${item}>`).join(' ')
          : 'All channels';
      const users =
        options.bannedUsersIds.length > 0
          ? options.bannedUsersIds.map((userId) => `<@${userId}>`).join(' ')
          : 'All users';

      const logChannel = await this.getLogChannel(options.guildId);
      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Shadow ban list has been updated')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Shadow ban with name **${options.name}** has been deleted by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Name', value: options.name })
        .addFields({ name: 'User', value: users })
        .addFields({ name: 'Channel', value: channels });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Shadow Ban Remove ${options.guildId}: ${e}`);
    }
  }

  public async roleAdd(options: RoleAddParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);
      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Add role to list')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has added <@&${options.role.id}> role to list`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Add ${options.guildId}: ${e}`);
    }
  }

  public async roleRemove(options: RoleRemoveParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);
      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Remove role from list')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has removed <@&${options.role.id}> role from list`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Remove ${options.guildId}: ${e}`);
    }
  }

  public async roleAllRemove(options: RoleRemoveAllParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);
      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Remove all roles from list')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has removed all roles from list`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Remove All ${options.guildId}: ${e}`);
    }
  }

  private async getLogChannel(guildId: string) {
    try {
      const guild = await this.guildRepository.findOne({
        where: { guildId: guildId },
      });
      return this.client.channels.cache.get(guild.logChannelId) as TextChannel;
    } catch (e) {
      this.logger.error(`Get log channel ${guildId}: ${e}`);
    }
  }
}
