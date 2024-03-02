import { Role, User } from 'discord.js';

export type RoleAddParams = {
  guildId: string;
  author: User;
  role: Role;
};

export type RoleRemoveParams = RoleAddParams;
export type AttachRoleParams = RoleAddParams;

export type RoleRemoveAllParams = {
  guildId: string;
  author: User;
};
