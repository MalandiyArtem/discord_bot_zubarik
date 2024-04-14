import { Injectable, Logger } from '@nestjs/common';
import { ScheduleCommandDecorator } from '../schedule-command-decorator';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { ScheduleMessageDto } from './dto/schedule-message.dto';
import { ScheduleUtilsService } from '../schedule-utils.service';
import { IDateParams } from '../interfaces/date-params.interface';
import { TenorGifService } from '../../../tenor-gif/tenor-gif.service';

@Injectable()
@ScheduleCommandDecorator()
export class ScheduleMessageService {
  private readonly logger = new Logger(ScheduleMessageService.name);

  constructor(
    private scheduleUtilsService: ScheduleUtilsService,
    private tenorGifService: TenorGifService,
  ) {}

  @Subcommand({
    name: 'message',
    description: 'Schedule your message',
    dmPermission: false,
  })
  public async onScheduleMessage(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: ScheduleMessageDto,
  ) {
    const dateParams: IDateParams = {
      day: dto.day,
      month: dto.month,
      year: dto.year || new Date().getUTCFullYear(),
      hours: dto.hours || 0,
      minutes: dto.minutes || 0,
      seconds: dto.seconds || 0,
    };
    const message = dto.message;
    const attachment = dto.attachment;
    const prompt = dto.prompt;

    if (
      !this.scheduleUtilsService.isDateParamsValid(dateParams, dto.timezone)
    ) {
      await interaction.reply({
        content: `Your message has not been scheduled: invalid date params`,
        ephemeral: true,
      });
      return Promise.resolve();
    }

    if (!message && !attachment && !prompt) {
      await interaction.reply({
        content: `You have to define at least one of the following parameters: message, attachment or prompt`,
        ephemeral: true,
      });
      return Promise.resolve();
    }

    const gifUrl = await this.tenorGifService.getRandomGif(prompt);

    const scheduledDate = this.scheduleUtilsService.getScheduledDate(
      dateParams,
      dto.timezone,
    );
    const readableDate = `${this.scheduleUtilsService.getReadableDate(dateParams)} (GMT ${dto.timezone})`;
  }
}
