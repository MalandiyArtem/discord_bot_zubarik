import { createCommandGroupDecorator } from 'necord';
import { PermissionFlagsBits } from 'discord.js';
import { CommandNamesEnum } from '../enums/command-names.enum';

export const ScheduleCommandDecorator = createCommandGroupDecorator({
  name: CommandNamesEnum.schedule,
  description: 'Schedule some events',
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
});
