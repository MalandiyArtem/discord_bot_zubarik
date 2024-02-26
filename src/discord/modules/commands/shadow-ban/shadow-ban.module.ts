import { Module } from '@nestjs/common';
import { ShadowBanService } from './shadow-ban.service';
import { UtilsModule } from '../../utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from './entities/shadow-ban.entity';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { PaginationModule } from '../../pagination/pagination.module';
import { EmbedsModule } from '../../embeds/embeds.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShadowBanEntity]),
    UtilsModule,
    ActionLoggerModule,
    PaginationModule,
    EmbedsModule,
  ],
  providers: [ShadowBanService],
})
export class ShadowBanModule {}
