import { Module } from '@nestjs/common';
import { TenorGifService } from './tenor-gif.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  exports: [TenorGifService],
  providers: [TenorGifService],
})
export class TenorGifModule {}
