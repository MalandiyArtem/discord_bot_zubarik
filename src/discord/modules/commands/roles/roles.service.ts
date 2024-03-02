import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { PermissionFlagsBits } from 'discord.js';
import { RolesDto } from './dto/roles.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEntity } from './entities/roles.entity';
import { ActionLoggerService } from '../../action-logger/action-logger.service';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(RolesEntity)
    private readonly rolesRepository: Repository<RolesEntity>,
    private readonly actionLoggerService: ActionLoggerService,
  ) {}

  @SlashCommand({
    name: 'add_role',
    description: 'Add role which will be available for users for self-picking',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onAddRole(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: RolesDto,
  ) {
    try {
      const roles = await this.rolesRepository.find({
        where: { guild: { guildId: interaction.guildId } },
      });

      const isRoleExist =
        roles.filter((role) => role.roleId === dto.role.id).length > 0;

      if (isRoleExist) {
        await interaction.reply({
          content: `Role **${dto.role.name}** is already exist`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      await this.rolesRepository.save({
        roleId: dto.role.id,
        guild: { guildId: interaction.guildId },
      });
      await interaction.reply({
        content: `Role **${dto.role.name}** has been successfully added`,
        ephemeral: true,
      });
      await this.actionLoggerService.roleAdd({
        guildId: interaction.guildId,
        role: dto.role,
        author: interaction.user,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong while adding role. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Set up logs ${interaction.guildId}: ${e}`);
    }
  }
}
