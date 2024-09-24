import { Module } from '@nestjs/common';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { HappyBirthdayService } from './happy-birthday.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HappyBirthdayConfigurationEntity } from './entities/happy-birthday-configuration.entity';
import { UtilsModule } from '../../utils/utils.module';
import { HappyBirthdayEntity } from './entities/happy-birthday.entity';
import { HappyBirthdayUtilsService } from './happy-birthday-utils.service';
import { TenorGifModule } from '../../tenor-gif/tenor-gif.module';
import { EmbedsModule } from '../../embeds/embeds.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HappyBirthdayConfigurationEntity,
      HappyBirthdayEntity,
    ]),
    ActionLoggerModule,
    UtilsModule,
    TenorGifModule,
    EmbedsModule,
  ],
  providers: [HappyBirthdayService, HappyBirthdayUtilsService],
})
export class HappyBirthdayModule {}
