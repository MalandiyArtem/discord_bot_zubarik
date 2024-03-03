import { User } from 'discord.js';

export type ReactionsAddParams = {
  guildId: string;
  name: string;
  channelIds: string[];
  userIds: string[];
  emojis: string[];
  author: User;
};
