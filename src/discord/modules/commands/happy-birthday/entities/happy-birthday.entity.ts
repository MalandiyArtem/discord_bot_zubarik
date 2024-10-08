import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HappyBirthdayConfigurationEntity } from './happy-birthday-configuration.entity';

@Entity({ name: 'happy_birthday' })
export class HappyBirthdayEntity {
  @PrimaryGeneratedColumn('increment')
  happyBirthdayId: number;

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column({ type: 'timestamp with time zone' })
  dateGMT0: Date;

  @Column()
  shortDate: string;

  @ManyToOne(
    () => HappyBirthdayConfigurationEntity,
    (happyBirthdayConfiguration) => happyBirthdayConfiguration.happyBirthdays,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  happyBirthdayConfiguration: HappyBirthdayConfigurationEntity;
}
