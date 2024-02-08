import { Body, Controller, Get, Post } from '@nestjs/common';
import { SongService } from './song.service';
import { Song } from './entities/song.entity';

@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  async create(@Body() createSongDto: Song) {
    return await this.songService.create(createSongDto);
  }

  @Get()
  async findAll() {
    return await this.songService.findAll();
  }
}
