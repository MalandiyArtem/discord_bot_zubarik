import { Module } from '@nestjs/common';
import { ShadowBanPaginationService } from './shadow-ban/shadow-ban-pagination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { EmbedsModule } from '../embeds/embeds.module';
import { ActionLoggerModule } from '../action-logger/action-logger.module';
import { RolePaginationService } from './role/role-pagination.service';
import { RolesEntity } from '../commands/roles/entities/roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShadowBanEntity, RolesEntity]),
    EmbedsModule,
    ActionLoggerModule,
  ],
  exports: [ShadowBanPaginationService, RolePaginationService],
  providers: [ShadowBanPaginationService, RolePaginationService],
})
export class PaginationModule {}
