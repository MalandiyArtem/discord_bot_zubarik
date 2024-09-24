import { Module } from '@nestjs/common';
import { SayService } from './say.service';

@Module({
  imports: [],
  providers: [SayService],
})
export class SayModule {}
