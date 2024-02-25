import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { GatewayIntentBits } from 'discord.js';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from './entities/guilds.entity';
import { GuildService } from './services/guild.service';
import { LogsChannelModule } from './modules/commands/logs-channel/logs-channel.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN,
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID],
    }),
    TypeOrmModule.forFeature([GuildsEntity]),
    LogsChannelModule,
  ],
  providers: [DiscordService, GuildService],
})
export class DiscordModule {}
