import { Module } from '@nestjs/common';
import { ShadowBanPaginationService } from './shadow-ban/shadow-ban-pagination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { EmbedsModule } from '../embeds/embeds.module';
import { ActionLoggerModule } from '../action-logger/action-logger.module';
import { RolePaginationService } from './role/role-pagination.service';
import { RolesEntity } from '../commands/roles/entities/roles.entity';
import { ReactionsEntity } from '../commands/reactions/entities/reactions.entity';
import { ScheduledMessagePaginationService } from './scheduled/scheduled-message-pagination.service';
import { ScheduledMessageEntity } from '../commands/schedule/message/entities/scheduled-message.entity';
import { ScheduledRenameEntity } from '../commands/schedule/rename/entities/scheduled-rename.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShadowBanEntity,
      RolesEntity,
      ReactionsEntity,
      ScheduledMessageEntity,
      ScheduledRenameEntity,
    ]),
    EmbedsModule,
    ActionLoggerModule,
  ],
  exports: [
    ShadowBanPaginationService,
    RolePaginationService,
    ScheduledMessagePaginationService,
  ],
  providers: [
    ShadowBanPaginationService,
    RolePaginationService,
    ScheduledMessagePaginationService,
  ],
})
export class PaginationModule {}
