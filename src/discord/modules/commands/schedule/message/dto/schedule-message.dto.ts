import {
  AttachmentOption,
  ChannelOption,
  IntegerOption,
  StringOption,
} from 'necord';
import { Attachment, ChannelType, GuildChannel } from 'discord.js';

export class ScheduleMessageDto {
  @IntegerOption({
    name: 'day',
    description: 'Day to schedule',
    min_value: 1,
    max_value: 31,
    required: true,
  })
  day: number;

  @IntegerOption({
    name: 'month',
    description: 'Month to schedule',
    min_value: 1,
    max_value: 12,
    required: true,
  })
  month: number;

  @IntegerOption({
    name: 'timezone',
    description: 'Select your timezone',
    required: true,
    choices: [
      { name: 'GMT -11', value: -11 },
      { name: 'GMT -10', value: -10 },
      { name: 'GMT -9', value: -9 },
      { name: 'GMT -8', value: -8 },
      { name: 'GMT -7', value: -7 },
      { name: 'GMT -6', value: -6 },
      { name: 'GMT -5', value: -5 },
      { name: 'GMT -4', value: -4 },
      { name: 'GMT -3', value: -3 },
      { name: 'GMT -2', value: -2 },
      { name: 'GMT -1', value: -1 },
      { name: 'GMT +0', value: 0 },
      { name: 'GMT +1', value: 1 },
      { name: 'GMT +2', value: 2 },
      { name: 'GMT +3', value: 3 },
      { name: 'GMT +4', value: 4 },
      { name: 'GMT +5', value: 5 },
      { name: 'GMT +6', value: 6 },
      { name: 'GMT +7', value: 7 },
      { name: 'GMT +8', value: 8 },
      { name: 'GMT +9', value: 9 },
      { name: 'GMT +10', value: 10 },
      { name: 'GMT +11', value: 11 },
      { name: 'GMT +12', value: 12 },
    ],
  })
  timezone: number;

  @ChannelOption({
    name: 'channel',
    description: 'The channel the message should be sent to',
    channel_types: [ChannelType.GuildText],
    required: true,
  })
  channel: GuildChannel;

  @IntegerOption({
    name: 'year',
    description: 'Year to schedule (if not provided it will use current year)',
    min_value: new Date().getUTCFullYear(),
    required: false,
  })
  year?: number;

  @IntegerOption({
    name: 'hours',
    description: 'Hours to schedule (if not provided it will use 00)',
    min_value: 0,
    max_value: 23,
    required: false,
  })
  hours?: number;

  @IntegerOption({
    name: 'minutes',
    description: 'Minutes to schedule (if not provided it will use 00)',
    min_value: 0,
    max_value: 59,
    required: false,
  })
  minutes?: number;

  @IntegerOption({
    name: 'seconds',
    description: 'Seconds to schedule (if not provided it will use 00)',
    min_value: 0,
    max_value: 59,
    required: false,
  })
  seconds?: number;

  @StringOption({
    name: 'message',
    description: 'Message to be scheduled!',
    max_length: 1799,
    required: false,
  })
  message?: string;

  @StringOption({
    name: 'prompt',
    description: 'Prompt to search gif',
    min_length: 1,
    max_length: 1799,
    required: false,
  })
  prompt?: string;

  @AttachmentOption({
    name: 'attachment',
    description: 'Attachment',
    required: false,
  })
  attachment?: Attachment;
}
