import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '../../../entities/guilds.entity';
import { LogsChannelService } from './logs-channel.service';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([GuildsEntity]), ActionLoggerModule],
  providers: [LogsChannelService],
})
export class LogsChannelModule {}
