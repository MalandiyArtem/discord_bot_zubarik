import { Module } from '@nestjs/common';
import { ScheduleMessageService } from './message/schedule-message.service';
import { ScheduleRenameChannelService } from './rename/schedule-rename-channel.service';
import { ScheduleUtilsService } from './schedule-utils.service';

@Module({
  imports: [],
  exports: [],
  providers: [
    ScheduleMessageService,
    ScheduleRenameChannelService,
    ScheduleUtilsService,
  ],
})
export class ScheduleModule {}
