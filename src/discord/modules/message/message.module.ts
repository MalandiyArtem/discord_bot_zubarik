import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShadowBanEntity])],
  exports: [],
  providers: [MessageService],
})
export class MessageModule {}
