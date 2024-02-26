import { Module } from '@nestjs/common';
import { ShadowBanPaginationService } from './shadow-ban/shadow-ban-pagination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { EmbedsModule } from '../embeds/embeds.module';
import { ActionLoggerModule } from '../action-logger/action-logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShadowBanEntity]),
    EmbedsModule,
    ActionLoggerModule,
  ],
  exports: [ShadowBanPaginationService],
  providers: [ShadowBanPaginationService],
})
export class PaginationModule {}
