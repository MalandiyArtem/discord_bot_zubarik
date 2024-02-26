import { ChannelOption } from 'necord';
import { ChannelType, GuildChannel } from 'discord.js';

export class LogsChannelDto {
  @ChannelOption({
    name: 'channel',
    description: 'Set up channel for logs (if empty disable logs)',
    channel_types: [ChannelType.GuildText],
  })
  channel: GuildChannel;
}
