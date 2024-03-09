import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';

@Injectable()
export class ShadowBanMessageHandlerService {
  private readonly logger = new Logger(ShadowBanMessageHandlerService.name);

  constructor(
    @InjectRepository(ShadowBanEntity)
    private readonly shadowBanRepository: Repository<ShadowBanEntity>,
  ) {}

  public async handle(message: Message) {
    try {
      const authorId = message.author.id;
      const channelId = message.channel.id;

      const shadowBan = await this.shadowBanRepository.find({
        where: {
          userIds: Like(`%${authorId}%`),
        },
      });

      if (shadowBan.length === 0) {
        return Promise.resolve();
      }

      for (const entity of shadowBan) {
        try {
          if (
            entity.userIds.includes(authorId) &&
            entity.channelIds.includes(channelId)
          ) {
            await message.delete();
            continue;
          }

          if (
            entity.userIds.includes(authorId) &&
            entity.channelIds.length === 0
          ) {
            await message.delete();
          }
        } catch (e) {
          this.logger.error(
            `Unable to delete message in guild ${message.guildId}: ${e}`,
          );
        }
      }
    } catch (e) {
      this.logger.error(`Shadow Ban Handler in guild ${message.guildId}: ${e}`);
    }
  }
}
