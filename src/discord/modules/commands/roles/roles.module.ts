import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';

@Module({
  imports: [],
  exports: [],
  providers: [RolesService],
})
export class RolesModule {}
