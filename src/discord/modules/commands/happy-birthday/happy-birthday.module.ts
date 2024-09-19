import { Module } from '@nestjs/common';
import { ActionLoggerModule } from '../../action-logger/action-logger.module';
import { HappyBirthdayService } from './happy-birthday.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HappyBirthdayConfigurationEntity } from './entities/happy-birthday-configuration.entity';
import { GuildsEntity } from '../../../entities/guilds.entity';
import { UtilsModule } from '../../utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HappyBirthdayConfigurationEntity, GuildsEntity]),
    ActionLoggerModule,
    UtilsModule,
  ],
  providers: [HappyBirthdayService],
})
export class HappyBirthdayModule {}
