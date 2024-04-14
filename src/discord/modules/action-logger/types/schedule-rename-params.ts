import { User } from 'discord.js';

export type ScheduleRenameParams = {
  guildId: string;
  readableDate: string;
  channelId: string;
  newChannelName: string;
  author: User;
};
