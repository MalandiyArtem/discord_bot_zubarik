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
import { ModuleRef } from '@nestjs/core';
import { ScheduledMessagePaginationService } from '../../../pagination/scheduled/scheduled-message-pagination.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as schedule from 'node-schedule';
import { Client, TextChannel } from 'discord.js';

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
    private readonly moduleRef: ModuleRef,
    private readonly client: Client,
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

  @Subcommand({
    name: 'message-list',
    description: 'Display list of scheduled messages',
    dmPermission: false,
  })
  public async onScheduleMessageList(
    @Context() [interaction]: SlashCommandContext,
  ) {
    const scheduledMessagePaginationService = await this.moduleRef.create(
      ScheduledMessagePaginationService,
    );
    await scheduledMessagePaginationService.showList(interaction);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSendScheduledMessageCron() {
    try {
      const currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() + 1);

      const utcDate = currentDate.toISOString();

      const scheduledMessages = await this.scheduledMessageEntityRepository
        .createQueryBuilder('scheduled_message')
        .where('scheduled_message.date <= :date', { date: utcDate })
        .getMany();

      for (const scheduledMessage of scheduledMessages.reverse()) {
        schedule.scheduleJob(scheduledMessage.date, async () => {
          await this.sendScheduledMessage(scheduledMessage);
        });
      }
    } catch (e) {
      this.logger.error(`Send Schedule Message Cron: `, e);
    }
  }

  private async sendScheduledMessage(scheduledMessage: ScheduledMessageEntity) {
    const channel = this.client.channels.cache.get(
      scheduledMessage.channelId,
    ) as TextChannel;

    if (!channel) return;

    if (scheduledMessage.attachmentUrl) {
      await channel.send({
        files: [{ attachment: scheduledMessage.attachmentUrl }],
      });
    }

    if (scheduledMessage.message) {
      await channel.send({ content: scheduledMessage.message });
    }

    if (scheduledMessage.gifUrl) {
      await channel.send({ content: scheduledMessage.gifUrl });
    }

    await this.deleteScheduledMessageFromDb(scheduledMessage.scheduleMessageId);
  }

  private async deleteScheduledMessageFromDb(scheduleMessageId: string) {
    await this.scheduledMessageEntityRepository.delete({
      scheduleMessageId: scheduleMessageId,
    });
  }
}
