import { Module } from '@nestjs/common';
import { ShadowBanService } from './shadow-ban.service';
import { UtilsModule } from '../../utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from './entities/shadow-ban.entity';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShadowBanEntity]),
    UtilsModule,
    ActionLoggerModule,
  ],
  providers: [ShadowBanService],
})
export class ShadowBanModule {}
