import { Injectable, Logger } from '@nestjs/common';
import { ScheduleCommandDecorator } from '../schedule-command-decorator';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { ScheduleRenameChannelDto } from './dto/schedule-rename-channel.dto';

@Injectable()
@ScheduleCommandDecorator()
export class ScheduleRenameChannelService {
  private readonly logger = new Logger(ScheduleRenameChannelService.name);

  constructor() {}

  @Subcommand({
    name: 'rename-channel',
    description: 'Schedule renaming channel',
    dmPermission: false,
  })
  public async onScheduleRenameChannel(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: ScheduleRenameChannelDto,
  ) {
    throw new Error('onScheduleRenameChannel is now implemented');
  }
}
