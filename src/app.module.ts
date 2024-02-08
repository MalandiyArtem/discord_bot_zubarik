import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule } from '@nestjs/config';
import { SongModule } from './song/song.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { DiscordService } from './discord/discord.service';

@Module({
  imports: [
    DiscordModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      username: process.env.PG_USER,
      password: process.env.PG_PASS,
      database: process.env.PG_DATABASE,
      ssl: true,
      autoLoadEntities: true,
      synchronize: true, // Not recommended for production
    }),
    SongModule,
  ],
  controllers: [],
  providers: [DiscordService],
})
export class AppModule {}
