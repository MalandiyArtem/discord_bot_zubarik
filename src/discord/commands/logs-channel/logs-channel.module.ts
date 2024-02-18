import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { LogsChannelService } from './logs-channel.service';

@Module({
  imports: [TypeOrmModule.forFeature([GuildsEntity])],
  providers: [LogsChannelService],
})
export class LogsChannelModule {}
