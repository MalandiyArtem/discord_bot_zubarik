import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ShadowBanEntity } from '../modules/commands/shadow-ban/entities/shadow-ban.entity';
import { RolesEntity } from '../modules/commands/roles/entities/roles.entity';
import { ReactionsEntity } from '../modules/commands/reactions/entities/reactions.entity';
import { ScheduledMessageEntity } from '../modules/commands/schedule/message/entities/scheduled-message.entity';
import { ScheduledRenameEntity } from '../modules/commands/schedule/rename/entities/scheduled-rename.entity';
import { HappyBirthdayConfigurationEntity } from '../modules/commands/happy-birthday/entities/happy-birthday-configuration.entity';

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

  @OneToMany(() => ReactionsEntity, (reactions) => reactions.guild)
  reactions: ReactionsEntity[];

  @OneToMany(
    () => ScheduledMessageEntity,
    (scheduledMessages) => scheduledMessages.guild,
  )
  scheduledMessages: ScheduledMessageEntity[];

  @OneToMany(
    () => ScheduledRenameEntity,
    (scheduledRenames) => scheduledRenames.guild,
  )
  scheduledRenames: ScheduledRenameEntity[];

  @OneToOne(() => HappyBirthdayConfigurationEntity)
  @JoinColumn({ name: 'happy_birthday_configuration_id' })
  happyBirthdayConfiguration: HappyBirthdayConfigurationEntity;
}
