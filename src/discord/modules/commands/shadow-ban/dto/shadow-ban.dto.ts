import { StringOption } from 'necord';

export class ShadowBanDto {
  @StringOption({
    name: 'name',
    description: 'Define unique name',
    required: true,
    min_length: 1,
    max_length: 100,
  })
  name: string;

  @StringOption({
    name: 'users',
    description: 'Users who will be banned (use @ to add user)',
    required: true,
  })
  users: string;

  @StringOption({
    name: 'channels',
    description: 'Channels where users will be banned',
    required: false,
  })
  channels: string;
}
