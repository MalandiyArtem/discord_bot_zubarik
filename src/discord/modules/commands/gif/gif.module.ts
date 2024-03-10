import { Module } from '@nestjs/common';
import { GifService } from './gif.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  exports: [],
  providers: [GifService],
})
export class GifModule {}
