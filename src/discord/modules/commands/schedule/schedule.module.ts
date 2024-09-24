import { Module } from '@nestjs/common';
import { ScheduleMessageService } from './message/schedule-message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledMessageEntity } from './message/entities/scheduled-message.entity';
import { TenorGifModule } from '../../tenor-gif/tenor-gif.module';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { ScheduledRenameEntity } from './rename/entities/scheduled-rename.entity';
import { ScheduleRenameChannelService } from './rename/schedule-rename-channel.service';
import { EmbedsModule } from '../../embeds/embeds.module';
import { UtilsModule } from '../../utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledMessageEntity, ScheduledRenameEntity]),
    TenorGifModule,
    ActionLoggerModule,
    EmbedsModule,
    UtilsModule,
  ],
  exports: [],
  providers: [ScheduleMessageService, ScheduleRenameChannelService],
})
export class ScheduleModule {}
