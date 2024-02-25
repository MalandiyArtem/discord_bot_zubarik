import { User } from 'discord.js';

export type ShadowBanAddParams = {
  guildId: string;
  author: User;
  name: string;
  bannedUsersIds: string[];
  channelIds: string[];
};
