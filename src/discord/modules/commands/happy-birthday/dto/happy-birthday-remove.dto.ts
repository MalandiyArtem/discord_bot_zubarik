import { StringOption } from 'necord';

export class HappyBirthdayRemoveDto {
  @StringOption({
    name: 'id',
    description: 'The id of the birthday',
    required: true,
  })
  id: string;
}
