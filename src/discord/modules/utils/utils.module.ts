import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Module({
  imports: [],
  exports: [UtilsService],
  providers: [UtilsService],
})
export class UtilsModule {}
