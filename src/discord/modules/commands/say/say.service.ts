import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { CommandNamesEnum } from '../enums/command-names.enum';
import { PermissionFlagsBits } from 'discord.js';
import { SayDto } from './dto/say.dto';

@Injectable()
export class SayService {
  private readonly logger = new Logger(SayService.name);

  @SlashCommand({
    name: CommandNamesEnum.say,
    description: 'Message to send immediately',
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  })
  public async onSay(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: SayDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Guild id can not be found. Try again',
        ephemeral: true,
      });

      return;
    }

    try {
      const message = dto.message;
      const attachment = dto.attachment;

      if (!message && !attachment) {
        await interaction.reply({
          content: `You have to define at least one of the following parameters: **message** or **attachment**`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      const channel = interaction.channel;
      if (!channel) {
        await interaction.reply({
          content: `Channel could not be found`,
          ephemeral: true,
        });
        return Promise.resolve();
      }

      if (message) {
        await channel.send({ content: message });
      }

      if (attachment) {
        await channel.send({ files: [{ attachment: attachment.url }] });
      }

      await interaction.reply({
        content: `Message has been sent`,
        ephemeral: true,
      });
    } catch (e) {
      await interaction.reply({
        content: `Something went wrong while using /say command. Please try again or contact support`,
        ephemeral: true,
      });
      this.logger.error(`Say command ${guildId}: ${e}`);
    }
  }
}
