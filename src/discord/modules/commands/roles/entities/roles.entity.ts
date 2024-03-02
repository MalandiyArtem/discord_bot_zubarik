import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuildsEntity } from '../../../../entities/guilds.entity';

@Entity({ name: 'roles' })
export class RolesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roleId: string;

  @ManyToOne(() => GuildsEntity, (guild) => guild.roleIds)
  @JoinColumn({ name: 'guildId' })
  guild: GuildsEntity;
}
