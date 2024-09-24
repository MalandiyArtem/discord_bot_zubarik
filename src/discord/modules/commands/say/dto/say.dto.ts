import { AttachmentOption, StringOption } from 'necord';
import { Attachment } from 'discord.js';

export class SayDto {
  @StringOption({
    name: 'message',
    description: 'Message to be send',
    required: false,
  })
  message?: string;

  @AttachmentOption({
    name: 'attachment',
    description: 'Attachment',
    required: false,
  })
  attachment?: Attachment;
}
