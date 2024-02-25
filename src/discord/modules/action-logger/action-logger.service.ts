import { Injectable, Logger } from '@nestjs/common';
import { Client, TextChannel, User } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { Repository } from 'typeorm';
import { EmbedsService } from '../embeds/embeds.service';

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
