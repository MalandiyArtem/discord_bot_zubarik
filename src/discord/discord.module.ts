import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { GatewayIntentBits } from 'discord.js';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';

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
  ],
  providers: [DiscordService],
})
export class DiscordModule {}
