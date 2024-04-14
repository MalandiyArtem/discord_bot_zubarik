import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    ScheduleModule.forRoot(),
    DiscordModule,
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
