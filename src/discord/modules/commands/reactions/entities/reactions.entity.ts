import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GuildsEntity } from '../../../../entities/guilds.entity';

@Entity({ name: 'reactions' })
export class ReactionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('simple-array')
  emojis: string[];

  @Column('simple-array')
  userIds: string[];

  @Column('simple-array')
  channelIds: string[];

  @ManyToOne(() => GuildsEntity, (guild) => guild.reactions)
  guild: GuildsEntity;
}
