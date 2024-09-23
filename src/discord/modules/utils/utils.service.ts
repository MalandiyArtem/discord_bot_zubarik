import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { IDateParams } from '../commands/schedule/interfaces/date-params.interface';
import { ReadableDateType } from '../commands/schedule/interfaces/readable-date.type';
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

  public getStringFormattedTime(time: number): string {
    return time < 10 ? String(time).padStart(2, '0') : String(time);
  }

  public isDateParamsValid(dateParams: IDateParams, timezone: number): boolean {
    try {
      const currentDate = new Date().getTime();
      const scheduledTime =
        this.getTimestamp(dateParams) -
        this.convertHoursToMilliseconds(timezone) +
        this.convertHoursToMilliseconds(this.getCurrentTimezoneOffset());

      if (scheduledTime <= currentDate) {
        throw new Error('Invalid date');
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  public getTimestamp(dateParams: IDateParams): number {
    try {
      const month = this.getStringFormattedTime(dateParams.month);
      const day = this.getStringFormattedTime(dateParams.day);
      const hours = this.getStringFormattedTime(dateParams.hours);
      const minutes = this.getStringFormattedTime(dateParams.minutes);
      const seconds = this.getStringFormattedTime(dateParams.seconds);

      const stringTime = `${dateParams.year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      const timestamp = new Date(stringTime).getTime();

      if (Number.isNaN(timestamp)) {
        throw new Error('Invalid date');
      }

      return timestamp;
    } catch (e) {
      throw new Error('Invalid date');
    }
  }

  public getGmtDate(dateParams: IDateParams, timezone: number): Date {
    const currentDate = new Date().getTime();
    const scheduledTime =
      this.getTimestamp(dateParams) -
      this.convertHoursToMilliseconds(timezone) +
      this.convertHoursToMilliseconds(this.getCurrentTimezoneOffset());

    const deltaTime = scheduledTime - currentDate;
    const date = new Date(currentDate + deltaTime);
    return date;
  }

  public getReadableDate(
    scheduledDate: IDateParams,
    type: ReadableDateType,
  ): string {
    const day = this.getStringFormattedTime(scheduledDate.day);
    const month = this.getStringFormattedTime(scheduledDate.month);
    const year = scheduledDate.year;
    const hours = this.getStringFormattedTime(scheduledDate.hours);
    const minutes = this.getStringFormattedTime(scheduledDate.minutes);
    const seconds = this.getStringFormattedTime(scheduledDate.seconds);

    switch (type) {
      case 'full-date-and-time': {
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      }
      case 'only-time': {
        return `${hours}:${minutes}:${seconds}`;
      }
      case 'only-date': {
        return `${day}.${month}.${year}`;
      }
      case 'date-without-year': {
        return `${day}.${month}`;
      }
      default: {
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      }
    }
  }

  private convertHoursToMilliseconds(hours: number) {
    return hours * 60 * 60 * 1000;
  }
  private getCurrentTimezoneOffset() {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset();

    const hoursOffset = Math.abs(Math.floor(timeZoneOffset / 60));

    return timeZoneOffset > 0 ? hoursOffset * -1 : hoursOffset;
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
