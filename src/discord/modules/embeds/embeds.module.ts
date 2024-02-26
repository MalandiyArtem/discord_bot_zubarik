import { Module } from '@nestjs/common';
import { EmbedsService } from './embeds.service';

@Module({
  imports: [],
  exports: [EmbedsService],
  providers: [EmbedsService],
})
export class EmbedsModule {}
