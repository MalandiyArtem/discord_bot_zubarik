import { User } from 'discord.js';

export type ScheduleMessageParams = {
  guildId: string;
  readableDate: string;
  channelId: string;
  author: User;
};
