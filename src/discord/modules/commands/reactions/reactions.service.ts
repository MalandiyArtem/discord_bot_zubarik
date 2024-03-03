import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReactionsService {
  private readonly logger = new Logger(ReactionsService.name);
}
