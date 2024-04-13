import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { GatewayIntentBits } from 'discord.js';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from './entities/guilds.entity';
import { GuildService } from './services/guild.service';
import { LogsChannelModule } from './modules/commands/logs-channel/logs-channel.module';
import { ShadowBanModule } from './modules/commands/shadow-ban/shadow-ban.module';
import { MessageModule } from './modules/message/message.module';
import { RolesModule } from './modules/commands/roles/roles.module';
import { ReactionsModule } from './modules/commands/reactions/reactions.module';
import { GifModule } from './modules/commands/gif/gif.module';
import { ScheduleModule } from './modules/commands/schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN || '',
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID || ''],
    }),
    TypeOrmModule.forFeature([GuildsEntity]),
    LogsChannelModule,
    ShadowBanModule,
    MessageModule,
    RolesModule,
    ReactionsModule,
    GifModule,
    ScheduleModule,
  ],
  providers: [DiscordService, GuildService],
})
export class DiscordModule {}
