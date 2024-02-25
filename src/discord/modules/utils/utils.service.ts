import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';

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
      .filter((id) => id !== null);

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
      .filter((id) => id !== null);

    return channelId;
  }

  private isChannel(channel: string): boolean {
    const regex = /^<#([0-9]+)>$/i;
    return regex.test(channel);
  }

  private isUser(user: string): boolean {
    const regex = /^<@([0-9]+)>$/i;
    return regex.test(user);
  }
}
