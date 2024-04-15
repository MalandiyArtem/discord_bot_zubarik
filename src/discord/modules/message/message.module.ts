import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { ReactionsEntity } from '../commands/reactions/entities/reactions.entity';
import { ShadowBanMessageHandlerService } from './shadow-ban-message-handler.service';
import { ReactionsMessageHandlerService } from './reactions-message-handler.service';
import { ActionLoggerModule } from '../action-logger/action-logger.module';
import { IncorrectCommandUseHandlerService } from './incorrect-command-use-handler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShadowBanEntity, ReactionsEntity]),
    ActionLoggerModule,
  ],
  exports: [],
  providers: [
    MessageService,
    ShadowBanMessageHandlerService,
    ReactionsMessageHandlerService,
    IncorrectCommandUseHandlerService,
  ],
})
export class MessageModule {}
