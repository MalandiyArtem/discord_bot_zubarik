import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'songs' })
export class SongEnt {
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

  @Column({ nullable: true })
  year: number;
}
