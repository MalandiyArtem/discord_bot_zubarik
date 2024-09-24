import { createCommandGroupDecorator } from 'necord';
import { CommandNamesEnum } from '../enums/command-names.enum';
import { PermissionFlagsBits } from 'discord.js';

export const HappyBirthdayCommandDecorator = createCommandGroupDecorator({
  name: CommandNamesEnum.happyBirthday,
  description: 'Happy Birthday management',
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
});
