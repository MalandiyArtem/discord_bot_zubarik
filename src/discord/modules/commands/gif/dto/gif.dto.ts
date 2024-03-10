import { StringOption } from 'necord';

export class GifDto {
  @StringOption({
    name: 'prompt',
    description: 'Prompt for gif',
    required: true,
  })
  prompt: string;
}
