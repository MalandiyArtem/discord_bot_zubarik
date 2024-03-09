import { Injectable } from '@nestjs/common';
import { Context, ContextOf, On } from 'necord';
import { ShadowBanMessageHandlerService } from './shadow-ban-message-handler.service';
import { ReactionsMessageHandlerService } from './reactions-message-handler.service';
import { ActionLoggerService } from '../action-logger/action-logger.service';

@Injectable()
export class MessageService {
  constructor(
    private shadowBanMessageHandlerService: ShadowBanMessageHandlerService,
    private reactionsMessageHandlerService: ReactionsMessageHandlerService,
    private actionLoggerService: ActionLoggerService,
  ) {}

  @On('messageCreate')
  public async onMessageCreate(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    this.shadowBanMessageHandlerService.handle(message);
    this.reactionsMessageHandlerService.handle(message);
  }

  @On('messageDelete')
  public async onMessageDelete(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    this.actionLoggerService.messageDelete(message);
  }
}
