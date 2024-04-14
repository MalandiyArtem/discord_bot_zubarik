import { Injectable, Logger } from '@nestjs/common';
import { ScheduleCommandDecorator } from '../schedule-command-decorator';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { ScheduleMessageDto } from './dto/schedule-message.dto';
import { ScheduleUtilsService } from '../schedule-utils.service';
import { IDateParams } from '../interfaces/date-params.interface';
import { TenorGifService } from '../../../tenor-gif/tenor-gif.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledMessageEntity } from './entities/scheduled-message.entity';
import { ActionLoggerService } from '../../../action-logger/action-logger.service';

@Injectable()
@ScheduleCommandDecorator()
export class ScheduleMessageService {
  private readonly logger = new Logger(ScheduleMessageService.name);

  constructor(
    private scheduleUtilsService: ScheduleUtilsService,
    private tenorGifService: TenorGifService,
    @InjectRepository(ScheduledMessageEntity)
    private readonly scheduledMessageEntityRepository: Repository<ScheduledMessageEntity>,
    private readonly actionLoggerService: ActionLoggerService,
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
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Guild id can not be found. Try again',
        ephemeral: true,
      });

      return;
    }

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

    const scheduledMessageResult =
      await this.scheduledMessageEntityRepository.save({
        authorId: interaction.user.id,
        channelId: dto.channel.id,
        date: scheduledDate,
        readableDate: readableDate,
        attachmentUrl: dto.attachment?.url,
        message: dto.message,
        gifUrl: gifUrl || undefined,
        guild: {
          guildId: guildId,
        },
      });

    if (scheduledMessageResult) {
      await interaction.reply({
        content: `Your message has been scheduled for \`${readableDate}\` in \`${dto.channel.name}\` channel`,
        ephemeral: true,
      });

      await this.actionLoggerService.scheduleMessageAdd({
        guildId: guildId,
        channelId: dto.channel.id,
        readableDate: readableDate,
        author: interaction.user,
      });
      return Promise.resolve();
    }

    await interaction.reply({
      content: 'Unable to schedule message. Please try again',
      ephemeral: true,
    });
  }
}
