import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ReactionsEntity } from '../commands/reactions/entities/reactions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReactionsMessageHandlerService {
  private readonly logger = new Logger(ReactionsMessageHandlerService.name);

  constructor(
    @InjectRepository(ReactionsEntity)
    private readonly reactionsRepository: Repository<ReactionsEntity>,
    private readonly client: Client,
  ) {}

  public async handle(message: Message) {
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
