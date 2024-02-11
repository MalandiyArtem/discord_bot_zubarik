import { IntegerOption, StringOption } from 'necord';

export class CreateSongDto {
  @StringOption({
    name: 'song_name',
    description: 'Song name',
    required: true,
  })
  name: string;

  @StringOption({
    name: 'song_artist',
    description: 'Song artist',
    required: true,
  })
  artist: string;

  @IntegerOption({
    name: 'song_duration',
    description: 'Song duration',
    required: true,
  })
  duration: number;

  @StringOption({
    name: 'song_genre',
    description: 'Song genre',
    required: true,
  })
  genre: string;

  @StringOption({
    name: 'song_album',
    description: 'Song album',
    required: true,
  })
  album: string;

  @IntegerOption({
    name: 'song_year',
    description: 'Song year',
    required: true,
  })
  year: number;
}
