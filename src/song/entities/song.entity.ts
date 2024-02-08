import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'songs' })
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  artist: string;

  @Column()
  duration: number;

  @Column()
  genre: string;

  @Column()
  album: string;
}
