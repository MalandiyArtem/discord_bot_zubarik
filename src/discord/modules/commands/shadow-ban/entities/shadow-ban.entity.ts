import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GuildsEntity } from '../../../../entities/guilds.entity';

@Entity({ name: 'shadow_ban' })
export class ShadowBanEntity {
  @PrimaryGeneratedColumn('uuid')
  banId: string;

  @Column({ unique: true })
  name: string;

  @Column('simple-array')
  userIds: string[];

  @Column('simple-array')
  channelIds: string[];

  @ManyToOne(() => GuildsEntity, (guild) => guild.shadowBans)
  guild: GuildsEntity;
}
