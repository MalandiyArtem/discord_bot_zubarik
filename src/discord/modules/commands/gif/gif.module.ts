import { Module } from '@nestjs/common';
import { GifService } from './gif.service';
import { ConfigModule } from '@nestjs/config';
import { TenorGifModule } from '../../tenor-gif/tenor-gif.module';

@Module({
  imports: [ConfigModule.forRoot(), TenorGifModule],
  exports: [],
  providers: [GifService],
})
export class GifModule {}
