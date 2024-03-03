import { Module } from '@nestjs/common';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { EmbedsModule } from '../../embeds/embeds.module';
import { ReactionsService } from './reactions.service';
import { UtilsModule } from '../../utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsEntity } from './entities/reactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReactionsEntity]),
    ActionLoggerModule,
    EmbedsModule,
    UtilsModule,
  ],
  exports: [],
  providers: [ReactionsService],
})
export class ReactionsModule {}
