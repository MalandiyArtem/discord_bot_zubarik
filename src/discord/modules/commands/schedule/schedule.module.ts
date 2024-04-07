import { Module } from '@nestjs/common';
import { ScheduleMessageService } from './message/schedule-message.service';
import { ScheduleRenameChannelService } from './rename/schedule-rename-channel.service';

@Module({
  imports: [],
  exports: [],
  providers: [ScheduleMessageService, ScheduleRenameChannelService],
})
export class ScheduleModule {}
