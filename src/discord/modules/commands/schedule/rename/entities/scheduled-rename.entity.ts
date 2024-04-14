import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GuildsEntity } from '../../../../../entities/guilds.entity';

@Entity({ name: 'scheduled_rename' })
export class ScheduledRenameEntity {
  @PrimaryGeneratedColumn('uuid')
  scheduleRenameId: string;

  @Column()
  authorId: string;

  @Column()
  channelId: string;

  @Column({ type: 'timestamp with time zone' })
  date: Date;

  @Column()
  readableDate: string;

  @Column()
  newChannelName: string;

  @ManyToOne(() => GuildsEntity, (guild) => guild.scheduledMessages)
  guild: GuildsEntity;
}
