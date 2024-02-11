import { Module } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), DiscordModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
