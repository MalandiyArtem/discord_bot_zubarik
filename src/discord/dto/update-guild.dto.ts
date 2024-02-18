export class UpdateGuildDto {
  readonly guildId: string;
  readonly oldName: string;
  readonly name: string;
  readonly ownerId: string;
}
