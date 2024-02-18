import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGuildDto {
  @IsNotEmpty()
  readonly guildId: string;
  @IsNotEmpty()
  readonly name: string;
  @IsOptional()
  readonly logChannelId?: string;
  @IsNotEmpty()
  readonly ownerId: string;
}
