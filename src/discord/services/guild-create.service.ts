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

  public async checkOnUnregisteredGuilds() {
    const guildsUsingBot = await this.client.guilds.fetch();
    const guildsRegisteredInDb = await this.guildRepository.find();

    const notRegisteredGuildId: string[] = [];

    for (const [guildId] of guildsUsingBot) {
      const isGuildRegistered = guildsRegisteredInDb.some(
        (guildEntity) => guildEntity.guildId === guildId,
      );

      if (!isGuildRegistered) {
        notRegisteredGuildId.push(guildId);
      }
    }

    for (const id of notRegisteredGuildId) {
      const guild = await this.client.guilds.fetch(id);
      await this.registerGuild({
        guildId: guild.id,
        name: guild.name,
        ownerId: guild.ownerId,
      });
    }
  }
}
