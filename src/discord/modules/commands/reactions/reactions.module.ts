import { Module } from '@nestjs/common';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { EmbedsModule } from '../../embeds/embeds.module';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [ActionLoggerModule, EmbedsModule],
  exports: [],
  providers: [ReactionsService],
})
export class ReactionsModule {}
