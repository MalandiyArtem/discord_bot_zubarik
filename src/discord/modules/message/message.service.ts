import { Injectable, Logger } from '@nestjs/common';
import { Context, ContextOf, On } from 'necord';
import { Message } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(ShadowBanEntity)
    private readonly shadowBanRepository: Repository<ShadowBanEntity>,
  ) {}

  @On('messageCreate')
  public async onMessageCreate(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    this.shadowBanHandler(message);
  }

  private async shadowBanHandler(message: Message) {
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
