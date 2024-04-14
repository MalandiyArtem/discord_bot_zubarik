import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GuildsEntity } from '../../../../../entities/guilds.entity';

@Entity({ name: 'scheduled_message' })
export class ScheduledMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  scheduleMessageId: string;

  @Column()
  authorId: string;

  @Column()
  channelId: string;

  @Column({ type: 'timestamp with time zone' })
  date: Date;

  @Column()
  readableDate: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  gifUrl: string;

  @ManyToOne(() => GuildsEntity, (guild) => guild.scheduledMessages)
  guild: GuildsEntity;
}
