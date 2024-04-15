import { Injectable } from '@nestjs/common';
import { Client, Message, TextChannel } from 'discord.js';
import { CommandNamesEnum } from '../commands/enums/command-names.enum';

@Injectable()
export class IncorrectCommandUseHandlerService {
  constructor(private readonly client: Client) {}
  public async handle(message: Message) {
    if (message.author.bot) return;

    const commandNames = Object.keys(CommandNamesEnum)
      .filter((key) => isNaN(Number(key)))
      .map((key) => CommandNamesEnum[key]);
    const cleanedMessage = message.content.replace(/[^a-zA-Z0-9- ]/g, '');
    const command = cleanedMessage.split(' ')[0];

    if (
      commandNames.some((commandName) => `/${commandName}` === `/${command}`)
    ) {
      const channel = this.client.channels.cache.get(
        message.channel.id,
      ) as TextChannel;

      const authorId = message.author.id;

      await channel.send(
        `<@${authorId}> To use this command you must not copy and paste it. Please write it by your hands 🙄`,
      );
    }
  }
}
