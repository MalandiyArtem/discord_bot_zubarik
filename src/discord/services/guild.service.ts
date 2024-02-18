import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '../entities/guilds.entity';
import { Repository } from 'typeorm';
import { CreateGuildDto } from '../dto/create-guild.dto';
import { UpdateGuildDto } from '../dto/update-guild.dto';

@Injectable()
export class GuildService {
  private readonly logger = new Logger(GuildService.name);

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

  public async updateGuildName(updateGuildData: UpdateGuildDto) {
    const guild = await this.guildRepository.findOne({
      where: { guildId: updateGuildData.guildId },
    });

    if (!guild) {
      await this.client.users.send(
        updateGuildData.ownerId,
        `Looks like you have updated guild name from **${updateGuildData.oldName}** to **${updateGuildData.name}**, but I couldn't update it in my data base. Please try again or contact support`,
      );
      return Promise.resolve();
    }

    const updatedGuild = Object.assign(guild, { name: updateGuildData.name });
    await this.guildRepository
      .save(updatedGuild)
      .then(async () => {
        await this.client.users.send(
          updateGuildData.ownerId,
          `Looks like you have updated guild name from **${updateGuildData.oldName}** to **${updateGuildData.name}**. Don't worry, I just notify you that everything is okay`,
        );
      })
      .catch(async (e) => {
        await this.client.users.send(
          updateGuildData.ownerId,
          `Looks like you have updated guild name from **${updateGuildData.oldName}** to **${updateGuildData.name}**, but I couldn't update it in my data base. Please try again or contact support`,
        );
        this.logger.error(`Update guild name ${guild.guildId}: ${e}`);
      });
  }
}
