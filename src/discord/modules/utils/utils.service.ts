import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const emojiRegex = require('emoji-regex');

@Injectable()
export class UtilsService {
  public getUserIds(
    users: string,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): string[] {
    const usersArray = users.split(' ');
    const userIds = usersArray
      .map((user) => {
        if (this.isUser(user)) {
          const userId = user.split('@')[1].slice(0, -1);

          if (interaction.guild?.members.resolve(userId)) {
            return userId;
          }
        }
        return null;
      })
      .filter((id) => id !== null) as string[];

    return userIds;
  }

  public getChannelIds(
    channels: string,
    interaction: ChatInputCommandInteraction<CacheType>,
  ): string[] {
    const channelsArray = channels.split(' ');
    const channelId = channelsArray
      .map((channel) => {
        if (this.isChannel(channel)) {
          const channelId = channel.split('#')[1].slice(0, -1);

          if (
            interaction.guild?.channels.cache.has(channelId) &&
            interaction.guild.channels.resolve(channelId)?.type ===
              ChannelType.GuildText
          ) {
            return channelId;
          }
        }
        return null;
      })
      .filter((id) => id !== null) as string[];

    return channelId;
  }

  public getEmojiIds(
    emoji: string,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const emojiArray = emoji.split(' ');
    const emojiIds = emojiArray
      .map((emoji) => {
        if (this.isCustomEmoji(emoji)) {
          const emojiId = emoji.split(':')[2].slice(0, -1);

          if (interaction.guild?.emojis.cache.has(emojiId)) {
            return emojiId;
          }
        }

        if (this.isUnicodeEmoji(emoji)) {
          return emoji;
        }

        return null;
      })
      .filter((id) => id !== null) as string[];

    return emojiIds;
  }

  private isChannel(channel: string): boolean {
    const regex = /^<#([0-9]+)>$/i;
    return regex.test(channel);
  }

  private isUser(user: string): boolean {
    const regex = /^<@([0-9]+)>$/i;
    return regex.test(user);
  }

  private isCustomEmoji(emoji: string): boolean {
    const regex = /^<:[^:]{2,}:([0-9]+)>$/i;
    return regex.test(emoji);
  }

  private isUnicodeEmoji(emoji: string): boolean {
    const regex = emojiRegex();
    const matches = emoji.match(regex);
    const regionalIndicatorSymbols = /^[\u{1F1E6}-\u{1F1FF}]{1}$/u;
    return (
      (matches !== null && matches.length === 1 && matches[0] === emoji) ||
      regionalIndicatorSymbols.test(emoji)
    );
  }
}
