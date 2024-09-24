import { User } from 'discord.js';

export type SetUpHappyBirthdayConfigurationParams = {
  guildId: string;
  channelId: string;
  timeWithTimezone: string;
  timezone: string;
  author: User;
};

export type RemoveHappyBirthdayConfigurationParams = {
  guildId: string;
  author: User;
};

export type HappyBirthdayAddParams = {
  guildId: string;
  author: User;
  userId: string;
  username: string;
  shortDate: string;
};

export type HappyBirthdayRemoveParams = {
  guildId: string;
  author: User;
  userId: string;
  username: string;
  shortDate: string;
};

export type HappyBirthdayRemoveAllParams = {
  guildId: string;
  author: User;
};
