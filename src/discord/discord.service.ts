import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildsEntity } from './entities/guilds.entity';
import { GuildCreateService } from './services/guild-create.service';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  public constructor(
    private readonly client: Client,
    @InjectRepository(GuildsEntity)
    private readonly guildRepository: Repository<GuildsEntity>,
    private guildCreateService: GuildCreateService,
  ) {}

  @Once('ready')
  public async onReady(@Context() [client]: ContextOf<'ready'>) {
    // const guilds = await client.guilds.fetch();
    // console.log(guilds);
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('guildCreate')
  public async onGuildCreate(@Context() [guild]: ContextOf<'guildCreate'>) {
    await this.guildCreateService.registerGuild({
      guildId: guild.id,
      name: guild.name,
      ownerId: guild.ownerId,
    });
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }
}
