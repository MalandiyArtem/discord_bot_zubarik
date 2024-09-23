import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client, Message, PartialMessage, TextChannel, User } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { Repository } from 'typeorm';
import { EmbedsService } from '../embeds/embeds.service';
import { ShadowBanLogParams } from './types/shadow-ban-add-params';
import {
  AttachRoleParams,
  RoleAddParams,
  RoleRemoveAllParams,
  RoleRemoveParams,
} from './types/role-params';
import { ReactionsLogParams } from './types/reactions-params';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS } from '../../../constants/cache';
import { ScheduleMessageParams } from './types/schedule-message-params';
import { ScheduleRenameParams } from './types/schedule-rename-params';
import {
  HappyBirthdayAddParams,
  HappyBirthdayRemoveAllParams,
  HappyBirthdayRemoveParams,
  RemoveHappyBirthdayConfigurationParams,
  SetUpHappyBirthdayConfigurationParams,
} from './types/happy-birthday-params';

@Injectable()
export class ActionLoggerService {
  private readonly logger = new Logger(ActionLoggerService.name);

  constructor(
    private readonly client: Client,
    @InjectRepository(GuildsEntity)
    private readonly guildRepository: Repository<GuildsEntity>,
    private readonly embedsService: EmbedsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async addLogChannel(guildId: string, author: User) {
    try {
      const logChannel = await this.getLogChannel(guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Log channel updated')
        .setThumbnail(author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Log channel has been added by <@${author?.id}>`,
        })
        .addFields({
          name: 'New log channel',
          value: `<#${logChannel.id}>`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Log add log channel ${guildId}: ${e}`);
    }
  }

  public async shadowBanAdd(options: ShadowBanLogParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const channels =
        options.channelIds.length > 0
          ? options.channelIds.map((item) => `<#${item}>`).join(' ')
          : 'All channels';
      const users =
        options.bannedUsersIds.length > 0
          ? options.bannedUsersIds.map((userId) => `<@${userId}>`).join(' ')
          : 'All users';

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Shadow ban list has been updated')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Shadow ban list has been updated by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Name', value: options.name })
        .addFields({ name: 'User', value: users })
        .addFields({ name: 'Channel', value: channels });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Shadow Ban Add ${options.guildId}: ${e}`);
    }
  }

  public async shadowBanRemove(options: ShadowBanLogParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const channels =
        options.channelIds.length > 0
          ? options.channelIds.map((item) => `<#${item}>`).join(' ')
          : 'All channels';
      const users =
        options.bannedUsersIds.length > 0
          ? options.bannedUsersIds.map((userId) => `<@${userId}>`).join(' ')
          : 'All users';

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Shadow ban list has been updated')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Shadow ban with name **${options.name}** has been deleted by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Name', value: options.name })
        .addFields({ name: 'User', value: users })
        .addFields({ name: 'Channel', value: channels });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Shadow Ban Remove ${options.guildId}: ${e}`);
    }
  }

  public async roleAdd(options: RoleAddParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Add role to list')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has added <@&${options.role.id}> role to list`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Add ${options.guildId}: ${e}`);
    }
  }

  public async roleRemove(options: RoleRemoveParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Remove role from list')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has removed <@&${options.role.id}> role from list`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Remove ${options.guildId}: ${e}`);
    }
  }

  public async roleAllRemove(options: RoleRemoveAllParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Remove all roles from list')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has removed all roles from list`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Remove All ${options.guildId}: ${e}`);
    }
  }

  public async roleAttach(options: AttachRoleParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('User added role')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has added <@&${options.role.id}> role`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Attach ${options.guildId}: ${e}`);
    }
  }

  public async roleDetach(options: AttachRoleParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('User removed role')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `<@${options.author?.id}> has removed <@&${options.role.id}> role`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Role Detach ${options.guildId}: ${e}`);
    }
  }

  public async reactionsAdd(options: ReactionsLogParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const channels =
        options.channelIds.length > 0
          ? options.channelIds.map((item) => `<#${item}>`).join(' ')
          : 'All channels';
      const users =
        options.userIds.length > 0
          ? options.userIds.map((userId) => `<@${userId}>`).join(' ')
          : 'All users';
      const emojis = options.emojis
        .map((emojiId) => `${this.client.emojis.cache.get(emojiId) || emojiId}`)
        .join(' ');

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('New reactions have been added')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Reaction have been added by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Name', value: options.name })
        .addFields({ name: 'Emoji', value: emojis })
        .addFields({ name: 'Channel', value: channels })
        .addFields({ name: 'User', value: users });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Reactions Add ${options.guildId}: ${e}`);
    }
  }

  public async reactionsRemove(options: ReactionsLogParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const channels =
        options.channelIds.length > 0
          ? options.channelIds.map((item) => `<#${item}>`).join(' ')
          : 'All channels';
      const users =
        options.userIds.length > 0
          ? options.userIds.map((userId) => `<@${userId}>`).join(' ')
          : 'All users';
      const emojis = options.emojis
        .map((emojiId) => `${this.client.emojis.cache.get(emojiId) || emojiId}`)
        .join(' ');

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Reaction have been removed')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Reaction have been removed by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Name', value: options.name })
        .addFields({ name: 'Emoji', value: emojis })
        .addFields({ name: 'Channel', value: channels })
        .addFields({ name: 'User', value: users });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Reaction Remove ${options.guildId}: ${e}`);
    }
  }

  public async messageDelete(message: Message) {
    if (!message.guild) return;
    try {
      const logChannel = await this.getLogChannel(message.guild.id);

      if (!logChannel) return Promise.resolve();

      const embeds = message.embeds;

      if (embeds.length > 0) {
        return Promise.resolve();
      }

      const author = message.author;
      const deletedMessage = message.content;
      const deletedAttachments = message.attachments;

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Message has been deleted')
        .setThumbnail(author?.avatarURL() || null)
        .setDescription(deletedMessage || ' ')
        .addFields({
          name: ' ',
          value: `Message has been deleted by <@${author?.id}>`,
        })
        .addFields({ name: ' ', value: `Channel <#${message.channelId}>` });

      await logChannel.send({ embeds: [embed] });

      if (deletedAttachments) {
        for (const [, attachment] of deletedAttachments) {
          await logChannel.send({ content: attachment.url });
        }
      }
    } catch (e) {
      this.logger.error(`Message delete ${message.guild.id}: ${e}`);
    }
  }

  public async messageUpdate(
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
  ) {
    if (!oldMessage.guild) return;
    try {
      if (oldMessage.author?.bot) return Promise.resolve();
      const logChannel = await this.getLogChannel(oldMessage.guild.id);

      if (!logChannel) return Promise.resolve();

      const oldAttachments = oldMessage.attachments.map(
        (attachment) => attachment.url,
      );
      const newAttachments = newMessage.attachments.map(
        (attachment) => attachment.url,
      );

      const embeds = oldMessage.embeds;
      if (
        (oldAttachments.length === newAttachments.length &&
          oldMessage.content === newMessage.content) ||
        embeds.length > 0
      ) {
        return Promise.resolve();
      }

      const author = oldMessage.author;

      const authorEmbed = this.embedsService
        .getUpdateEmbed(true)
        .setTitle('Message has been edited')
        .setThumbnail(author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Message has been edited by <@${author?.id}>`,
          inline: true,
        })
        .addFields({ name: ' ', value: `Channel <#${oldMessage.channelId}>` });

      const oldMessageEmbed = this.embedsService
        .getUpdateEmbed(true)
        .setTitle('Old message')
        .setDescription(`${oldMessage || ' '} \n ${oldAttachments.join('\n')}`);

      const newMessageEmbed = this.embedsService
        .getUpdateEmbed()
        .setTitle('New message')
        .setDescription(`${newMessage || ' '} \n ${newAttachments.join('\n')}`);

      await logChannel.send({
        embeds: [authorEmbed],
      });

      await logChannel.send({
        embeds: [oldMessageEmbed],
      });

      await logChannel.send({
        embeds: [newMessageEmbed],
      });
    } catch (e) {
      this.logger.error(`Message update ${oldMessage.guild.id}: ${e}`);
    }
  }

  public async scheduleMessageAdd(options: ScheduleMessageParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Scheduled message has been added')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Message has been scheduled by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Date', value: options.readableDate })
        .addFields({ name: 'Channel name', value: `<#${options.channelId}>` });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Schedule Message Add ${options.guildId}: ${e}`);
    }
  }

  public async scheduleMessageRemove(options: ScheduleMessageParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Scheduled message has been removed')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Message has been removed by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Date', value: options.readableDate })
        .addFields({ name: 'Channel name', value: `<#${options.channelId}>` });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Schedule Message Remove ${options.guildId}: ${e}`);
    }
  }

  public async scheduleRenameAdd(options: ScheduleRenameParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Scheduled rename channel has been added')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Renaming has been scheduled by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Date', value: options.readableDate })
        .addFields({ name: 'Channel name', value: `<#${options.channelId}>` })
        .addFields({
          name: 'New channel name',
          value: `${options.newChannelName}`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Schedule Rename Add ${options.guildId}: ${e}`);
    }
  }

  public async scheduleRenameRemove(options: ScheduleRenameParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Scheduled rename channel has been removed')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Renaming has been removed by <@${options.author?.id}>`,
        })
        .addFields({ name: 'Date', value: options.readableDate })
        .addFields({ name: 'Channel name', value: `<#${options.channelId}>` })
        .addFields({
          name: 'New channel name',
          value: `${options.newChannelName}`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(`Schedule Rename Add ${options.guildId}: ${e}`);
    }
  }

  public async happyBirthdayConfigurationAdd(
    options: SetUpHappyBirthdayConfigurationParams,
  ) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('Configuration for happy birthdays has been added')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Configuration has been added by <@${options.author?.id}>`,
        })
        .addFields({
          name: `Time (GMT ${Number(options.timezone) < 0 ? `-${options.timezone}` : `+${options.timezone}`})`,
          value: options.timeWithTimezone,
          inline: true,
        })
        .addFields({
          name: 'Channel name',
          value: `<#${options.channelId}>`,
          inline: true,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(
        `[Action logger] Happy Birthday Config Add ${options.guildId}: ${e}`,
      );
    }
  }

  public async happyBirthdayConfigurationUpdate(
    options: SetUpHappyBirthdayConfigurationParams,
  ) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getUpdateEmbed()
        .setTitle('Configuration for happy birthdays has been updated')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Configuration has been updated by <@${options.author?.id}>`,
        })
        .addFields({
          name: `Time (GMT ${Number(options.timezone) < 0 ? `-${options.timezone}` : `+${options.timezone}`})`,
          value: options.timeWithTimezone,
          inline: true,
        })
        .addFields({
          name: 'Channel name',
          value: `<#${options.channelId}>`,
          inline: true,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(
        `[Action Logger] Happy Birthday Config Update ${options.guildId}: ${e}`,
      );
    }
  }

  public async happyBirthdayConfigurationRemove(
    options: RemoveHappyBirthdayConfigurationParams,
  ) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Configuration for happy birthdays has been removed')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Configuration has been removed by <@${options.author?.id}>`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(
        `[Action Logger] Happy Birthday Config Remove ${options.guildId}: ${e}`,
      );
    }
  }

  public async happyBirthdayAdd(options: HappyBirthdayAddParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getAddEmbed()
        .setTitle('New happy birthday has been added')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `New happy birthday has been added by <@${options.author?.id}>`,
        })
        .addFields({
          name: 'User',
          value: `<@${options.userId}>`,
          inline: true,
        })
        .addFields({
          name: 'Username',
          value: options.username,
          inline: true,
        })
        .addFields({
          name: 'Date',
          value: options.shortDate,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(
        `[Action Logger] Happy Birthday Add ${options.guildId}: ${e}`,
      );
    }
  }

  public async happyBirthdayRemove(options: HappyBirthdayRemoveParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('Happy birthday has been removed')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `Happy birthday has been removed by <@${options.author?.id}>`,
        })
        .addFields({
          name: 'User',
          value: `<@${options.userId}>`,
          inline: true,
        })
        .addFields({
          name: 'Username',
          value: options.username,
          inline: true,
        })
        .addFields({
          name: 'Date',
          value: options.shortDate,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(
        `[Action Logger] Happy Birthday Remove ${options.guildId}: ${e}`,
      );
    }
  }

  public async happyBirthdayRemoveAll(options: HappyBirthdayRemoveAllParams) {
    try {
      const logChannel = await this.getLogChannel(options.guildId);

      if (!logChannel) return Promise.resolve();

      const embed = this.embedsService
        .getRemoveEmbed()
        .setTitle('All happy birthdays has been removed')
        .setThumbnail(options.author?.avatarURL() || null)
        .addFields({
          name: ' ',
          value: `All happy birthdays has been removed by <@${options.author?.id}>`,
        });

      await logChannel.send({ embeds: [embed] });
    } catch (e) {
      this.logger.error(
        `[Action Logger] Happy Birthday Remove All ${options.guildId}: ${e}`,
      );
    }
  }

  private async getLogChannel(guildId: string) {
    try {
      const cacheLogChannel = await this.cacheManager.get<string>(
        CACHE_KEYS.GUILD_LOG_CHANNEL.key.replace('{guildId}', guildId),
      );

      if (cacheLogChannel) {
        return this.client.channels.cache.get(cacheLogChannel) as TextChannel;
      }

      const guild = await this.guildRepository.findOne({
        where: { guildId: guildId },
      });

      if (!guild?.logChannelId) return;

      await this.cacheManager.set(
        CACHE_KEYS.GUILD_LOG_CHANNEL.key.replace('{guildId}', guild.guildId),
        guild.logChannelId,
        CACHE_KEYS.GUILD_LOG_CHANNEL.ttl,
      );

      return this.client.channels.cache.get(guild.logChannelId) as TextChannel;
    } catch (e) {
      this.logger.error(`Get log channel ${guildId}: ${e}`);
    }
  }
}
