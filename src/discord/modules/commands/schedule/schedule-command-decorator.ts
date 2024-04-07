import { createCommandGroupDecorator } from 'necord';
import { PermissionFlagsBits } from 'discord.js';

export const ScheduleCommandDecorator = createCommandGroupDecorator({
  name: 'schedule',
  description: 'Schedule some events',
  dmPermission: false,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
});
