import { Injectable, Logger } from '@nestjs/common';
import {
  Context,
  ContextOf,
  On,
  Once,
  Options,
  SlashCommand,
  SlashCommandContext,
} from 'necord';
import { TextDto } from './length.dto';

// class TextDto {
//   @StringOption({
//     name: 'text',
//     description: 'Your text',
//     required: true,
//   })
//   text: string;
// }

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  @Once('ready')
  public onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }

  @SlashCommand({
    name: 'length',
    description: 'Get length of text',
  })
  public async onLength(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: TextDto,
  ) {
    console.log(dto.text);
    return interaction.reply({ content: `Length of your text "{text.length"` });
  }
}
