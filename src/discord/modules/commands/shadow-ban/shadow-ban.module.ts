import { Module } from '@nestjs/common';
import { ShadowBanService } from './shadow-ban.service';
import { UtilsModule } from '../../utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShadowBanEntity } from './entities/shadow-ban.entity';
import { GuildsEntity } from '../../../entities/guilds.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShadowBanEntity, GuildsEntity]),
    UtilsModule,
  ],
  providers: [ShadowBanService],
})
export class ShadowBanModule {}
