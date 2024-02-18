import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../entities/guilds.entity';
import { Repository } from 'typeorm';
import { CreateGuildDto } from '../dto/create-guild.dto';

@Injectable()
export class GuildCreateService {
  private readonly logger = new Logger(GuildCreateService.name);

  constructor(
    private readonly client: Client,
    @InjectRepository(GuildsEntity)
    private readonly guildRepository: Repository<GuildsEntity>,
  ) {}

  public async registerGuild(guildDto: CreateGuildDto) {
    try {
      await this.guildRepository.save({
        guildId: guildDto.guildId,
        name: guildDto.name,
        ownerId: guildDto.ownerId,
      });
      await this.client.users.send(
        guildDto.ownerId,
        `Congratulations! You have successfully added me to ${guildDto.name}`,
      );
    } catch (e) {
      await this.client.users.send(
        guildDto.ownerId,
        `Something wrong with adding me to the ${guildDto.name}. Please, try again!`,
      );
      this.logger.log(
        `Guild create error. guildID: ${guildDto.guildId} : ${e}`,
      );
    }
  }
}
