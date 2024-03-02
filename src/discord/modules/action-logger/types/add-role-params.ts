import { Role, User } from 'discord.js';

export type AddRoleParams = {
  guildId: string;
  author: User;
  role: Role;
};
