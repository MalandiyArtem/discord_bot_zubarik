import { StringOption } from 'necord';

export class ReactionsDto {
  @StringOption({
    name: 'name',
    description: 'Define unique name',
    required: true,
    min_length: 1,
    max_length: 100,
  })
  name: string;

  @StringOption({
    name: 'emoji',
    description: 'Emoji to be used (use space to divide)',
    required: true,
  })
  emoji: string;

  @StringOption({
    name: 'channels',
    description:
      'Channels where reactions will be added (use # to add channels. Only text channels are available)',
    required: false,
  })
  channels: string;

  @StringOption({
    name: 'users',
    description:
      'Users who will be reacted (use @ to add user and space to divide them)',
    required: false,
  })
  users: string;
}
