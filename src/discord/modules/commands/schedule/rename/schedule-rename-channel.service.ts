import { Injectable, Logger } from '@nestjs/common';
import { ScheduleCommandDecorator } from '../schedule-command-decorator';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { ScheduleRenameChannelDto } from './dto/schedule-rename-channel.dto';
import { ScheduleUtilsService } from '../schedule-utils.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledRenameEntity } from './entities/scheduled-rename.entity';
import { ActionLoggerService } from '../../../action-logger/action-logger.service';
import { IDateParams } from '../interfaces/date-params.interface';

@Injectable()
@ScheduleCommandDecorator()
export class ScheduleRenameChannelService {
  private readonly logger = new Logger(ScheduleRenameChannelService.name);

  constructor(
    private scheduleUtilsService: ScheduleUtilsService,
    @InjectRepository(ScheduledRenameEntity)
    private readonly scheduledRenameEntityRepository: Repository<ScheduledRenameEntity>,
    private readonly actionLoggerService: ActionLoggerService,
  ) {}

  @Subcommand({
    name: 'rename-channel',
    description: 'Schedule renaming channel',
    dmPermission: false,
  })
  public async onScheduleRenameChannel(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: ScheduleRenameChannelDto,
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

    if (
      !this.scheduleUtilsService.isDateParamsValid(dateParams, dto.timezone)
    ) {
      await interaction.reply({
        content: `Renaming has not been scheduled: invalid date params`,
        ephemeral: true,
      });
      return Promise.resolve();
    }

    const scheduledDate = this.scheduleUtilsService.getScheduledDate(
      dateParams,
      dto.timezone,
    );
    const readableDate = `${this.scheduleUtilsService.getReadableDate(dateParams)} (GMT ${dto.timezone})`;

    const scheduledRenameResult =
      await this.scheduledRenameEntityRepository.save({
        authorId: interaction.user.id,
        channelId: dto.channel.id,
        date: scheduledDate,
        readableDate: readableDate,
        newChannelName: dto.newChannelName,
        guild: {
          guildId: guildId,
        },
      });

    if (scheduledRenameResult) {
      await interaction.reply({
        content: `Renaming channel \`${dto.channel.name}\` to \`${dto.newChannelName}\` has been scheduled for \`${readableDate}\``,
        ephemeral: true,
      });

      await this.actionLoggerService.scheduleRenameAdd({
        guildId: guildId,
        channelId: dto.channel.id,
        readableDate: readableDate,
        author: interaction.user,
        newChannelName: dto.newChannelName,
      });
      return Promise.resolve();
    }

    await interaction.reply({
      content: 'Unable to schedule renaming. Please try again',
      ephemeral: true,
    });
  }
}
