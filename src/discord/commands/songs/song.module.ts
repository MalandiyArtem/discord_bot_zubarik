import { Module } from '@nestjs/common';
import { SongService } from './song.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongEntity } from './entities/song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SongEntity])],
  providers: [SongService],
})
export class SongModule {}
