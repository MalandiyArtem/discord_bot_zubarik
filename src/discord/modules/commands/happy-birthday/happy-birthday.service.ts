import { Injectable, Logger } from '@nestjs/common';
import { HappyBirthdayCommandDecorator } from './happy-birthday-command-decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HappyBirthdayConfigurationEntity } from './entities/happy-birthday-configuration.entity';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { CommandNamesEnum } from '../enums/command-names.enum';
import { HappyBirthdayConfigurationDto } from './dto/happy-birthday-configuration.dto';
import { GuildsEntity } from '../../../entities/guilds.entity';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
@HappyBirthdayCommandDecorator()
export class HappyBirthdayService {
  private readonly logger = new Logger(HappyBirthdayService.name);

  constructor(
    @InjectRepository(HappyBirthdayConfigurationEntity)
    private readonly happyBirthdayConfigurationRepository: Repository<HappyBirthdayConfigurationEntity>,
    @InjectRepository(GuildsEntity)
    private readonly guildsRepository: Repository<GuildsEntity>,
    private readonly utilService: UtilsService,
  ) {}

  @Subcommand({
    name: CommandNamesEnum.happyBirthday_configuration_add,
    description: 'Set up configuration of greetings',
    dmPermission: false,
  })
  public async setupHappyBirthdayConfiguration(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: HappyBirthdayConfigurationDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Guild id can not be found. Try again',
        ephemeral: true,
      });

      return;
    }

    const happyBirthdayConfig =
      await this.happyBirthdayConfigurationRepository.findOne({
        where: {
          guild: {
            guildId: guildId,
          },
        },
      });

    const channelId = dto.channel.id;
    const timeZone = dto.timezone.toString();
    const hours = this.utilService.getStringFormattedTime(dto.hours || 0);
    const minutes = this.utilService.getStringFormattedTime(dto.minutes || 0);
    const seconds = this.utilService.getStringFormattedTime(dto.seconds || 0);
    const time = `${hours}:${minutes}:${seconds}`;

    if (happyBirthdayConfig) {
      await this.happyBirthdayConfigurationRepository.update(
        { configurationId: happyBirthdayConfig.configurationId },
        {
          channelId: channelId,
          timezone: timeZone,
          time: time,
        },
      );
      await interaction.reply({
        content: 'Configuration has been successfully updated',
        ephemeral: true,
      });
      return;
    }

    await this.happyBirthdayConfigurationRepository.save({
      channelId: channelId,
      timezone: timeZone,
      time: time,
      guild: {
        guildId: guildId,
      },
    });
    await interaction.reply({
      content: 'Configuration has been successfully created',
      ephemeral: true,
    });
  }

  @Subcommand({
    name: CommandNamesEnum.happyBirthday_configuration_remove,
    description: 'Remove configuration channel for greetings',
    dmPermission: false,
  })
  public async removeHappyBirthdayConfigurationChannel(
    @Context() [interaction]: SlashCommandContext,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Guild id can not be found. Try again',
        ephemeral: true,
      });

      return;
    }

    const happyBirthdayConfig =
      await this.happyBirthdayConfigurationRepository.findOne({
        where: {
          guild: {
            guildId: guildId,
          },
        },
      });

    if (!happyBirthdayConfig || !happyBirthdayConfig.channelId) {
      await interaction.reply({
        content: "You didn't have configurations to remove",
        ephemeral: true,
      });
      return;
    }

    await this.happyBirthdayConfigurationRepository.update(
      {
        configurationId: happyBirthdayConfig.configurationId,
      },
      {
        channelId: null,
      },
    );

    await interaction.reply({
      content:
        'You have successfully removed channel for greetings. Bot will not send greetings anymore',
      ephemeral: true,
    });
  }
}
