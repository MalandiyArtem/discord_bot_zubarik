import { IntegerOption, StringOption } from 'necord';

export class CreateSongDto {
  @StringOption({
    name: 'song_name',
    description: 'Song name',
    required: true,
  })
  song_name: string;

  @StringOption({
    name: 'song_artist',
    description: 'Song artist',
    required: true,
  })
  song_artist: string;

  @IntegerOption({
    name: 'song_duration',
    description: 'Song duration',
    required: true,
  })
  song_duration: number;

  @StringOption({
    name: 'song_genre',
    description: 'Song genre',
    required: true,
  })
  song_genre: string;

  @StringOption({
    name: 'song_album',
    description: 'Song album',
    required: true,
  })
  song_album: string;
}
