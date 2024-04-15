import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import {
  CacheType,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';
import { RolesDto } from './dto/roles.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEntity } from './entities/roles.entity';
import { ActionLoggerService } from '../../action-logger/action-logger.service';
import { ModuleRef } from '@nestjs/core';
import { RolePaginationService } from '../../pagination/role/role-pagination.service';
import { CommandNamesEnum } from '../enums/command-names.enum';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(RolesEntity)
    private readonly rolesRepository: Repository<RolesEntity>,
    private readonly actionLoggerService: ActionLoggerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @SlashCommand({
    name: CommandNamesEnum.roleAdd,
    description: 'Add role which will be available for users for self-picking',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onAddRole(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: RolesDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const roles = await this.rolesRepository.find({
        where: { guild: { guildId: guildId } },
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
        guild: { guildId: guildId },
      });
      await interaction.reply({
        content: `Role **${dto.role.name}** has been successfully added`,
        ephemeral: true,
      });
      await this.actionLoggerService.roleAdd({
        guildId: guildId,
        role: dto.role,
        author: interaction.user,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong while adding role. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Add role ${guildId}: ${e}`);
    }
  }

  @SlashCommand({
    name: CommandNamesEnum.roleRemove,
    description: 'Remove role from list for users for self-picking',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onRemoveRole(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: RolesDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const role = await this.rolesRepository.findOne({
        where: {
          guild: { guildId: guildId },
          roleId: dto.role.id,
        },
      });

      if (!role) {
        await interaction.reply({
          content: `Role **${dto.role.name}** hasn't been removed. Role **${dto.role.name}** doesn't exist in list`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      await this.rolesRepository.delete({
        guild: { guildId: guildId },
        roleId: role.roleId,
      });
      await interaction.reply({
        content: `Role **${dto.role.name}** has been successfully removed`,
        ephemeral: true,
      });
      await this.actionLoggerService.roleRemove({
        guildId: guildId,
        role: dto.role,
        author: interaction.user,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong while removing role. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Remove role ${guildId}: ${e}`);
    }
  }

  @SlashCommand({
    name: CommandNamesEnum.roleRemoveAll,
    description: 'Remove all roles from list for users for self-picking',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onRemoveAllRole(@Context() [interaction]: SlashCommandContext) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const roles = await this.rolesRepository.find({
        where: {
          guild: { guildId: guildId },
        },
      });

      if (roles.length === 0) {
        await interaction.reply({
          content: 'Role list is empty',
          ephemeral: true,
        });
        return Promise.resolve();
      }

      for (const role of roles) {
        await this.rolesRepository.delete({
          guild: { guildId: guildId },
          roleId: role.roleId,
        });
      }

      await interaction.reply({
        content: 'All roles have been successfully removed',
        ephemeral: true,
      });
      await this.actionLoggerService.roleAllRemove({
        guildId: guildId,
        author: interaction.user,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong while removing all roles. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Remove all roles ${guildId}: ${e}`);
    }
  }

  @SlashCommand({
    name: CommandNamesEnum.role,
    description: 'Get or get rid of the role',
    dmPermission: false,
  })
  public async onRole(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: RolesDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      if (user?.roles.cache.has(dto.role.id)) {
        await this.detachRole(interaction, dto, user);
        return Promise.resolve();
      }

      if (user) {
        await this.attachRole(interaction, dto, user);
      }
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Attach or detach role ${guildId}: ${e}`);
    }
  }

  @SlashCommand({
    name: CommandNamesEnum.roleList,
    description: 'Display list of available roles',
    dmPermission: false,
  })
  public async onRoleList(@Context() [interaction]: SlashCommandContext) {
    const roleListPaginationService = await this.moduleRef.create(
      RolePaginationService,
    );
    await roleListPaginationService.showList(interaction);
  }

  private async attachRole(
    interaction: ChatInputCommandInteraction<CacheType>,
    roleDto: RolesDto,
    user: GuildMember,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const role = await this.rolesRepository.findOne({
        where: {
          guild: { guildId: guildId },
          roleId: roleDto.role.id,
        },
      });

      if (!role) {
        await interaction.reply({
          content: `The role **${roleDto.role.name}** can\'t be added. Please use **/role_list** to see all available roles to pick`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      const roleInfo = interaction.guild?.roles.cache.get(roleDto.role.id);
      await user.roles.add(role.roleId);
      await interaction.reply({
        content: `The role **${roleInfo?.name}** has been added successfully.`,
        ephemeral: true,
      });
      await this.actionLoggerService.roleAttach({
        guildId: guildId,
        author: interaction.user,
        role: roleDto.role,
      });
    } catch (e) {
      this.logger.error(`Attach role ${guildId}: ${e}`);
      await interaction.reply({
        content:
          "An error occurred while adding the role. If it is role with admin permissions, bot can't assign it",
        ephemeral: true,
      });
    }
  }

  private async detachRole(
    interaction: ChatInputCommandInteraction<CacheType>,
    roleDto: RolesDto,
    user: GuildMember,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const role = await this.rolesRepository.findOne({
        where: {
          guild: { guildId: guildId },
          roleId: roleDto.role.id,
        },
      });

      if (!role) {
        await interaction.reply({
          content: `The role **${roleDto.role.name}** can\'t be removed. Please use **/role_list** to see all available roles to remove`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      const roleInfo = interaction.guild?.roles.cache.get(roleDto.role.id);
      await user.roles.remove(role.roleId);
      await interaction.reply({
        content: `The role **${roleInfo?.name}** has been removed successfully.`,
        ephemeral: true,
      });
      await this.actionLoggerService.roleDetach({
        guildId: guildId,
        author: interaction.user,
        role: roleDto.role,
      });
    } catch (e) {
      this.logger.error(`Attach role ${guildId}: ${e}`);
      await interaction.reply({
        content:
          "An error occurred while adding the role. If it is role with admin permissions, bot can't assign it",
        ephemeral: true,
      });
    }
  }
}
