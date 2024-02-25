import { User } from 'discord.js';

export type ShadowBanLogParams = {
  guildId: string;
  author: User;
  name: string;
  bannedUsersIds: string[];
  channelIds: string[];
};
