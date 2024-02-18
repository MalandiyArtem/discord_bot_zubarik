import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { LogsChannelDto } from './dto/logs-channel.dto';
import {
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogsChannelService {
  private readonly logger = new Logger(LogsChannelService.name);

  constructor(
    private readonly client: Client,
    @InjectRepository(GuildsEntity)
    private readonly guildRepository: Repository<GuildsEntity>,
  ) {}

  @SlashCommand({
    name: 'logs',
    description: 'Set up channel for logs (if empty disable logs)',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onLogsChannel(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: LogsChannelDto,
  ) {
    const guild = await this.guildRepository.findOne({
      where: { guildId: interaction.guildId },
    });

    if (dto.channel) {
      const updatedGuild = Object.assign(guild, {
        logChannelId: dto.channel.id,
      });
      await this.guildRepository
        .save(updatedGuild)
        .then(async () => {
          // TODO: Create service for building embeds
          const logsEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Log channel updated')
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setThumbnail(interaction.user?.avatarURL() || null)
            .addFields({
              name: ' ',
              value: `Log channel has been added by <@${interaction.user?.id}>`,
            })
            .addFields({
              name: 'New log channel',
              value: `<#${dto.channel.id}>`,
            })
            .setTimestamp()
            .setFooter({ text: 'Big Brother is always watching you' });

          await interaction.reply({
            content: 'Channel for logs successfully added',
            ephemeral: true,
          });

          const channel = dto.channel as TextChannel;
          await channel.send({ embeds: [logsEmbed] });
        })
        .catch(async (e) => {
          await this.client.users.send(
            guild.ownerId,
            `Looks like you want to set up channel for logs in **${guild.name}**, but unfortunately something went wrong. Please try again or contact support`,
          );
          this.logger.error(`Set up logs ${guild.guildId}: ${e}`);
        });

      return Promise.resolve();
    }

    const updatedGuild = Object.assign(guild, {
      logChannelId: null,
    });
    await this.guildRepository
      .save(updatedGuild)
      .then(async () => {
        await interaction.reply({
          content: 'Logs channel successfully removed',
          ephemeral: true,
        });
      })
      .catch(async (e) => {
        await this.client.users.send(
          guild.ownerId,
          `Looks like you want to remove logs channel in **${guild.name}**, but unfortunately something went wrong. Please try again or contact support`,
        );
        this.logger.error(`Remove logs ${guild.guildId}: ${e}`);
      });
  }
}
