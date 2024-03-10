import { Injectable, Logger } from '@nestjs/common';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';
import { GifDto } from './dto/gif.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ITenorResponse } from './interfaces/tenor.interface';

@Injectable()
export class GifService {
  private readonly logger = new Logger(GifService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @SlashCommand({
    name: 'gif',
    description: 'Send random gif',
    dmPermission: false,
  })
  public async onGif(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: GifDto,
  ) {
    const gifUrl = await this.getRandomGif(dto.prompt);

    if (gifUrl) {
      await interaction.reply({ content: gifUrl });
      return Promise.resolve();
    }

    await interaction.reply({ content: 'Gif was not found', ephemeral: true });
  }

  private async getRandomGif(prompt: string) {
    const tenorToken = this.configService.get<string>('TENOR_TOKEN');
    const params = {
      key: tenorToken,
      q: prompt,
      random: true,
      limit: 1,
    };

    const { data } = await firstValueFrom(
      this.httpService
        .get<ITenorResponse>('https://tenor.googleapis.com/v2/search', {
          params,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error('Unable to get Tenor gif: ', error);
            throw error;
          }),
        ),
    );

    return data.results[0].url;
  }
}
