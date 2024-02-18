import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  public constructor(private readonly client: Client) {}

  @Once('ready')
  public async onReady(@Context() [client]: ContextOf<'ready'>) {
    const guilds = await client.guilds.fetch();
    console.log(guilds);
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('guildCreate')
  public onReady2(@Context() [guild]: ContextOf<'guildCreate'>) {
    console.log(guild);
    this.logger.log(`GUILD ${guild}`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }
}
