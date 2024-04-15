import { Injectable } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { GifDto } from './dto/gif.dto';
import { TenorGifService } from '../../tenor-gif/tenor-gif.service';
import { CommandNamesEnum } from '../enums/command-names.enum';

@Injectable()
export class GifService {
  constructor(private tenorGifService: TenorGifService) {}

  @SlashCommand({
    name: CommandNamesEnum.gif,
    description: 'Send random gif',
    dmPermission: false,
  })
  public async onGif(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: GifDto,
  ) {
    const gifUrl = await this.tenorGifService.getRandomGif(dto.prompt);

    if (gifUrl) {
      await interaction.reply({ content: gifUrl });
      return Promise.resolve();
    }

    await interaction.reply({ content: 'Gif was not found', ephemeral: true });
  }
}
