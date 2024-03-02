import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ShadowBanEntity } from '../modules/commands/shadow-ban/entities/shadow-ban.entity';
import { RolesEntity } from '../modules/commands/roles/entities/roles.entity';

@Entity({ name: 'guilds' })
export class GuildsEntity {
  @PrimaryColumn()
  guildId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logChannelId: string;

  @Column()
  ownerId: string;

  @OneToMany(() => ShadowBanEntity, (shadowBan) => shadowBan.guild)
  shadowBans: ShadowBanEntity[];

  @OneToMany(() => RolesEntity, (roles) => roles.guild)
  roleIds: RolesEntity[];
}
