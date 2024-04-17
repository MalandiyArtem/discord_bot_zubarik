import { Injectable, Logger } from '@nestjs/common';
import { Context, ContextOf, On, Once } from 'necord';
import { GuildService } from './services/guild.service';
import { ActivityType, Client } from 'discord.js';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  public constructor(
    private guildService: GuildService,
    private readonly client: Client,
  ) {}

  @Once('ready')
  public async onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
    this.client.user?.setActivity('v2.0.1', { type: ActivityType.Playing });
    await this.guildService.checkOnUnregisteredGuilds();
  }

  @On('guildCreate')
  public async onGuildCreate(@Context() [guild]: ContextOf<'guildCreate'>) {
    await this.guildService.registerGuild({
      guildId: guild.id,
      name: guild.name,
      ownerId: guild.ownerId,
    });
  }

  @On('guildUpdate')
  public async onGuildUpdate(
    @Context() [oldGuild, newGuild]: ContextOf<'guildUpdate'>,
  ) {
    if (oldGuild.name !== newGuild.name) {
      await this.guildService.updateGuildName({
        guildId: oldGuild.id,
        name: newGuild.name,
        ownerId: newGuild.ownerId,
        oldName: oldGuild.name,
      });
    }
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }
}
