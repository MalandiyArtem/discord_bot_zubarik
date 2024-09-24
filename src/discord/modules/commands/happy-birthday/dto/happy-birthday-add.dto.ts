import { IntegerOption, StringOption, UserOption } from 'necord';
import { User } from 'discord.js';

export class HappyBirthdayAddDto {
  @UserOption({
    name: 'user',
    description: 'The user whose birthday is',
    required: true,
  })
  user: User;

  @StringOption({
    name: 'username',
    description:
      'Add any username to identify the user in case they change their name',
    required: true,
  })
  username: string;

  @IntegerOption({
    name: 'day',
    description: 'The day of the birthday',
    min_value: 1,
    max_value: 31,
    required: true,
  })
  day: number;

  @IntegerOption({
    name: 'month',
    description: 'The month of the birthday',
    min_value: 1,
    max_value: 12,
    required: true,
  })
  month: number;
}
