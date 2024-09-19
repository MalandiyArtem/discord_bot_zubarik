import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GuildsEntity } from '../../../../entities/guilds.entity';

@Entity({ name: 'happy_birthday_configuration' })
export class HappyBirthdayConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  configurationId: string;

  @Column({ type: 'varchar', nullable: true })
  channelId: string | null;

  @Column({ type: 'time without time zone', nullable: false })
  time: string;

  @Column({ nullable: false })
  timezone: string;

  @OneToOne(() => GuildsEntity, (guild) => guild.happyBirthdayConfiguration)
  guild: GuildsEntity;
}
