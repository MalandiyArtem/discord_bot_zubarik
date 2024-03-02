import { Role, User } from 'discord.js';

export type AddRemoveRoleParams = {
  guildId: string;
  author: User;
  role: Role;
};
