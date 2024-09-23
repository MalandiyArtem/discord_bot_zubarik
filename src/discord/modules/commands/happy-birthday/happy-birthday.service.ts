import { Injectable, Logger } from '@nestjs/common';
import { HappyBirthdayCommandDecorator } from './happy-birthday-command-decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HappyBirthdayConfigurationEntity } from './entities/happy-birthday-configuration.entity';
import { Context, Opts, SlashCommandContext, Subcommand } from 'necord';
import { CommandNamesEnum } from '../enums/command-names.enum';
import { HappyBirthdayConfigurationDto } from './dto/happy-birthday-configuration.dto';
import { UtilsService } from '../../utils/utils.service';
import { HappyBirthdayAddDto } from './dto/happy-birthday-add.dto';
import { HappyBirthdayEntity } from './entities/happy-birthday.entity';
import { HappyBirthdayUtilsService } from './happy-birthday-utils.service';
import { HappyBirthdayRemoveDto } from './dto/happy-birthday-remove.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IDateParams } from '../schedule/interfaces/date-params.interface';

@Injectable()
@HappyBirthdayCommandDecorator()
export class HappyBirthdayService {
  private readonly logger = new Logger(HappyBirthdayService.name);

  constructor(
    @InjectRepository(HappyBirthdayConfigurationEntity)
    private readonly happyBirthdayConfigurationRepository: Repository<HappyBirthdayConfigurationEntity>,
    @InjectRepository(HappyBirthdayEntity)
    private readonly happyBirthdayRepository: Repository<HappyBirthdayEntity>,
    private readonly utilService: UtilsService,
    private readonly happyBirthdayUtilService: HappyBirthdayUtilsService,
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
    const timeGMT0 = this.happyBirthdayUtilService.convertToGMT0(
      `${hours}:${minutes}:${seconds}`,
      Number(timeZone),
    );
    const timeWithTimezone = `${hours}:${minutes}:${seconds}`;

    if (happyBirthdayConfig) {
      await this.happyBirthdayConfigurationRepository.update(
        { configurationId: happyBirthdayConfig.configurationId },
        {
          channelId: channelId,
          timezone: timeZone,
          timeGMT0: timeGMT0,
          timeWithTimezone: timeWithTimezone,
        },
      );

      const updatedConfig =
        await this.happyBirthdayConfigurationRepository.findOne({
          where: { configurationId: happyBirthdayConfig.configurationId },
        });

      const allBirthdays = await this.happyBirthdayRepository.find({
        where: {
          happyBirthdayConfiguration: {
            configurationId: updatedConfig?.configurationId,
          },
        },
      });

      for (const birthday of allBirthdays) {
        const [hours, minutes, seconds] = updatedConfig?.timeWithTimezone.split(
          ':',
        ) || ['00', '00', '00'];
        const [day, month] = birthday.shortDate.split('.').map(Number);

        const dateParams: IDateParams = {
          day: day,
          month: month,
          year: new Date().getUTCFullYear(),
          hours: Number(hours) || 0,
          minutes: Number(minutes) || 0,
          seconds: Number(seconds) || 0,
        };

        const gmtDate = this.utilService.getGmtDate(
          dateParams,
          Number(happyBirthdayConfig.timezone),
        );

        await this.happyBirthdayRepository.update(
          {
            happyBirthdayId: birthday.happyBirthdayId,
          },
          {
            dateGMT0: gmtDate,
          },
        );
      }

      await interaction.reply({
        content: 'Configuration has been successfully updated',
        ephemeral: true,
      });
      return;
    }

    await this.happyBirthdayConfigurationRepository.save({
      channelId: channelId,
      timezone: timeZone,
      timeGMT0: timeGMT0,
      timeWithTimezone: timeWithTimezone,
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

  @Subcommand({
    name: CommandNamesEnum.happyBirthday_add,
    description: 'Add birthday',
    dmPermission: false,
  })
  public async addBirthday(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: HappyBirthdayAddDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Guild id can not be found. Try again',
        ephemeral: true,
      });

      return;
    }

    const userId = dto.user.id;
    const username = dto.username;
    const day = dto.day;
    const month = dto.month;

    const isDateValid = this.happyBirthdayUtilService.isBirthdayDateValid(
      day,
      month,
    );

    if (!isDateValid) {
      await interaction.reply({
        content: 'Date is not valid',
        ephemeral: true,
      });

      return;
    }

    const happyBirthdayConfig =
      await this.findOrCreateHappyBirthdayConfig(guildId);

    const [hours, minutes, seconds] =
      happyBirthdayConfig.timeWithTimezone.split(':');

    const dateParams: IDateParams = {
      day: day,
      month: month,
      year: new Date().getUTCFullYear(),
      hours: Number(hours) || 0,
      minutes: Number(minutes) || 0,
      seconds: Number(seconds) || 0,
    };

    const gmtDate = this.utilService.getGmtDate(
      dateParams,
      Number(happyBirthdayConfig.timezone),
    );
    const readableDate = `${this.utilService.getReadableDate(dateParams, 'date-without-year')}`;

    await this.happyBirthdayRepository.save({
      happyBirthdayConfiguration: {
        configurationId: happyBirthdayConfig.configurationId,
      },
      userId: userId,
      username: username,
      dateGMT0: gmtDate,
      shortDate: readableDate,
    });

    await interaction.reply({
      content: `You have successfully added birthday of **${username}** to the list.`,
    });
  }

  @Subcommand({
    name: CommandNamesEnum.happyBirthday_remove,
    description: 'Remove birthday',
    dmPermission: false,
  })
  public async removeBirthday(
    @Context() [interaction]: SlashCommandContext,
    @Opts() dto: HappyBirthdayRemoveDto,
  ) {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Guild id can not be found. Try again',
        ephemeral: true,
      });

      return;
    }

    const birthdayId = Number.isNaN(Number(dto.id)) ? -1 : Number(dto.id);

    const happyBirthday = await this.happyBirthdayRepository.findOne({
      where: {
        happyBirthdayId: birthdayId,
      },
    });

    if (!happyBirthday) {
      await interaction.reply({
        content: `A record with ID **${dto.id}** was not found`,
        ephemeral: true,
      });
      return;
    }

    await this.happyBirthdayRepository.delete({
      happyBirthdayId: birthdayId,
    });

    await interaction.reply({
      content: `A record of **${happyBirthday.username}** has been removed`,
      ephemeral: true,
    });
  }

  @Subcommand({
    name: CommandNamesEnum.happyBirthday_remove_all,
    description: 'Remove all birthday',
    dmPermission: false,
  })
  public async removeAllBirthday(
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
      await this.findOrCreateHappyBirthdayConfig(guildId);

    await this.happyBirthdayRepository.delete({
      happyBirthdayConfiguration: {
        configurationId: happyBirthdayConfig.configurationId,
      },
    });

    await interaction.reply({
      content: `All birthdays have been successfully removed`,
      ephemeral: true,
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSendHappyBirthdayCron() {}

  private async findOrCreateHappyBirthdayConfig(guildId: string) {
    let happyBirthdayConfig =
      await this.happyBirthdayConfigurationRepository.findOne({
        where: { guild: { guildId } },
      });

    if (!happyBirthdayConfig) {
      happyBirthdayConfig =
        await this.happyBirthdayConfigurationRepository.save({
          channelId: null,
          timezone: '0',
          time: '00:00:00',
          guild: { guildId },
        });
    }

    return happyBirthdayConfig;
  }
}
