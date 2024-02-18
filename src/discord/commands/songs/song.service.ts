import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SongEnt } from './entities/song.ent';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(SongEnt)
    private readonly songRepository: Repository<SongEnt>,
  ) {}

  async create(createSongDto: CreateSongDto): Promise<CreateSongDto> {
    return await this.songRepository.save(createSongDto);
  }

  async findAll(): Promise<SongEnt[]> {
    return this.songRepository.find();
  }

  @SlashCommand({
    name: 'song',
    description: 'Create song',
  })
  public async onSong(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: CreateSongDto,
  ) {
    await this.create(dto);
    return interaction.reply({
      content: `New song with name ${dto.name} was added`,
    });
  }
}
