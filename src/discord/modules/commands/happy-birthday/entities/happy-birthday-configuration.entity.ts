import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuildsEntity } from '../../../../entities/guilds.entity';
import { HappyBirthdayEntity } from './happy-birthday.entity';

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

  @OneToMany(
    () => HappyBirthdayEntity,
    (happyBirthday) => happyBirthday.happyBirthdayConfiguration,
  )
  happyBirthdays: HappyBirthdayEntity[];
}
