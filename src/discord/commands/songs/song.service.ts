import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SongEntity } from './entities/song.entity';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';
import { Context, Opts, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(SongEntity)
    private readonly songRepository: Repository<SongEntity>,
  ) {}

  async create(createSongDto: CreateSongDto): Promise<CreateSongDto> {
    return await this.songRepository.save(createSongDto);
  }

  async findAll(): Promise<SongEntity[]> {
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
