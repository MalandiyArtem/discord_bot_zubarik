import { Injectable, Logger } from '@nestjs/common';
import { Client, TextChannel, User } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { Repository } from 'typeorm';
import { EmbedsService } from '../embeds/embeds.service';
import { ShadowBanAddParams } from './types/shadow-ban-add-params';

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

  public async shadowBanAdd(options: ShadowBanAddParams) {
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
