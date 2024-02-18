import { Module } from '@nestjs/common';
import { SongService } from './song.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongEnt } from './entities/song.ent';

@Module({
  imports: [TypeOrmModule.forFeature([SongEnt])],
  providers: [SongService],
})
export class SongModule {}
