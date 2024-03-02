import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity]), ActionLoggerModule],
  exports: [],
  providers: [RolesService],
})
export class RolesModule {}
