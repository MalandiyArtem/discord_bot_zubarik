import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { ReactionsEntity } from '../commands/reactions/entities/reactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShadowBanEntity, ReactionsEntity])],
  exports: [],
  providers: [MessageService],
})
export class MessageModule {}
