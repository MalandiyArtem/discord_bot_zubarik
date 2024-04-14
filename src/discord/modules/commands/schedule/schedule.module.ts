import { Module } from '@nestjs/common';
import { ScheduleMessageService } from './message/schedule-message.service';
import { ScheduleUtilsService } from './schedule-utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledMessageEntity } from './message/entities/scheduled-message.entity';
import { TenorGifModule } from '../../tenor-gif/tenor-gif.module';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { ScheduledRenameEntity } from './rename/entities/scheduled-rename.entity';
import { ScheduleRenameChannelService } from './rename/schedule-rename-channel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledMessageEntity, ScheduledRenameEntity]),
    TenorGifModule,
    ActionLoggerModule,
  ],
  exports: [],
  providers: [
    ScheduleMessageService,
    ScheduleRenameChannelService,
    ScheduleUtilsService,
  ],
})
export class ScheduleModule {}
