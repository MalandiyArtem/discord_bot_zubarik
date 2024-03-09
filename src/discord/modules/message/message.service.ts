import { Injectable, Logger } from '@nestjs/common';
import { Context, ContextOf, On } from 'necord';
import { Client, Message } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { Like, Repository } from 'typeorm';
import { ReactionsEntity } from '../commands/reactions/entities/reactions.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(ShadowBanEntity)
    private readonly shadowBanRepository: Repository<ShadowBanEntity>,
    @InjectRepository(ReactionsEntity)
    private readonly reactionsRepository: Repository<ReactionsEntity>,
    private readonly client: Client,
  ) {}

  @On('messageCreate')
  public async onMessageCreate(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    this.shadowBanHandler(message);
    this.reactionsHandler(message);
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

  private async reactionsHandler(message: Message) {
    try {
      const authorId = message.author.id;
      const channelId = message.channel.id;
      const reactions = await this.reactionsRepository.find({
        where: {
          guild: { guildId: message.guild.id },
        },
      });

      for (const item of reactions) {
        if (item.channelIds.length === 0 && item.userIds.length === 0) {
          await this.setReaction(item.emojis, message);
          continue;
        }

        if (
          item.userIds.includes(authorId) &&
          item.channelIds.includes(channelId)
        ) {
          await this.setReaction(item.emojis, message);
          continue;
        }

        if (item.userIds.includes(authorId) && item.channelIds.length === 0) {
          await this.setReaction(item.emojis, message);
          continue;
        }

        if (item.channelIds.includes(channelId) && item.userIds.length === 0) {
          await this.setReaction(item.emojis, message);
        }
      }
    } catch (e) {
      this.logger.error(`Set reactions in guild ${message.guildId}: ${e}`);
    }
  }

  private async setReaction(idList: string[], message: Message<boolean>) {
    for (const emojiId of idList) {
      const emoji = this.client.emojis.cache.get(emojiId) || emojiId;
      await message.react(emoji);
    }
  }
}
