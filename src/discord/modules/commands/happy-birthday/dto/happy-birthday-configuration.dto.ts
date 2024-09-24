import { ChannelOption, IntegerOption } from 'necord';
import { ChannelType, GuildChannel } from 'discord.js';

export class HappyBirthdayConfigurationDto {
  @ChannelOption({
    name: 'channel',
    description: 'The channel the greetings should be sent to',
    channel_types: [ChannelType.GuildText],
    required: true,
  })
  channel: GuildChannel;

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

  @IntegerOption({
    name: 'hours',
    description: 'Hours for sending greetings (if not provided it will use 00)',
    min_value: 0,
    max_value: 23,
    required: false,
  })
  hours?: number;

  @IntegerOption({
    name: 'minutes',
    description:
      'Minutes for sending greetings (if not provided it will use 00)',
    min_value: 0,
    max_value: 59,
    required: false,
  })
  minutes?: number;

  @IntegerOption({
    name: 'seconds',
    description:
      'Seconds for sending greetings (if not provided it will use 00)',
    min_value: 0,
    max_value: 59,
    required: false,
  })
  seconds?: number;
}
