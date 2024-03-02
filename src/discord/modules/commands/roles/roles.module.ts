import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { EmbedsModule } from '../../embeds/embeds.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolesEntity]),
    ActionLoggerModule,
    EmbedsModule,
  ],
  exports: [],
  providers: [RolesService],
})
export class RolesModule {}
