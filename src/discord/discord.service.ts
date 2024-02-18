import { Injectable, Logger } from '@nestjs/common';
import { Context, ContextOf, On, Once } from 'necord';
import { GuildCreateService } from './services/guild-create.service';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  public constructor(private guildCreateService: GuildCreateService) {}

  @Once('ready')
  public async onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
    await this.guildCreateService.checkOnUnregisteredGuilds();
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
