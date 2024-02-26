import { Module } from '@nestjs/common';
import { ActionLoggerService } from './action-logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '../../entities/guilds.entity';
import { EmbedsModule } from '../embeds/embeds.module';

@Module({
  imports: [TypeOrmModule.forFeature([GuildsEntity]), EmbedsModule],
  exports: [ActionLoggerService],
  providers: [ActionLoggerService],
})
export class ActionLoggerModule {}
