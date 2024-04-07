import { Injectable, Logger } from '@nestjs/common';
import { ScheduleCommandDecorator } from '../schedule-command-decorator';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { ScheduleMessageDto } from './dto/schedule-message.dto';

@Injectable()
@ScheduleCommandDecorator()
export class ScheduleMessageService {
  private readonly logger = new Logger(ScheduleMessageService.name);

  constructor() {}

  @Subcommand({
    name: 'message',
    description: 'Schedule your message',
    dmPermission: false,
  })
  public async onScheduleMessage(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: ScheduleMessageDto,
  ) {
    throw new Error('onScheduleMessage is now implemented');
  }
}
