import { Module } from '@nestjs/common';
import { ScheduleMessageService } from './message/schedule-message.service';

@Module({
  imports: [],
  exports: [],
  providers: [ScheduleMessageService],
})
export class ScheduleModule {}
