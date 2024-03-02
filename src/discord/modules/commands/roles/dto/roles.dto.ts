import { RoleOption } from 'necord';
import { Role } from 'discord.js';

export class RolesDto {
  @RoleOption({
    name: 'role',
    description: 'Role which will be available for users for self-picking',
    required: true,
  })
  role: Role;
}
