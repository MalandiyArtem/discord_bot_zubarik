import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShadowBanEntity } from '../commands/shadow-ban/entities/shadow-ban.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS } from '../../../constants/cache';

@Injectable()
export class ShadowBanMessageHandlerService {
  private readonly logger = new Logger(ShadowBanMessageHandlerService.name);

  constructor(
    @InjectRepository(ShadowBanEntity)
    private readonly shadowBanRepository: Repository<ShadowBanEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async handle(message: Message) {
    const guildId = message.guildId;

    if (!guildId) return;

    try {
      const authorId = message.author.id;
      const channelId = message.channel.id;

      const shadowBan = await this.getShadowBanData(authorId, guildId);

      if (shadowBan.length === 0) {
        return Promise.resolve();
      }

      for (const entity of shadowBan) {
        try {
          if (
            entity.userIds.includes(authorId) &&
            entity.channelIds.includes(channelId)
          ) {
            await message.delete();
            continue;
          }

          if (
            entity.userIds.includes(authorId) &&
            entity.channelIds.length === 0
          ) {
            await message.delete();
          }
        } catch (e) {
          this.logger.error(
            `Unable to delete message in guild ${guildId}: ${e}`,
          );
        }
      }
    } catch (e) {
      this.logger.error(`Shadow Ban Handler in guild ${guildId}: ${e}`);
    }
  }

  private async getShadowBanData(authorId: string, guildId: string) {
    const cacheShadowBan = await this.cacheManager.get<ShadowBanEntity[]>(
      CACHE_KEYS.SHADOW_BAN.key
        .replace('{guildId}', guildId)
        .replace('{userId}', authorId),
    );

    if (cacheShadowBan) {
      return cacheShadowBan;
    }

    const shadowBan = await this.shadowBanRepository.find({
      where: {
        userIds: Like(`%${authorId}%`),
      },
    });

    await this.cacheManager.set(
      CACHE_KEYS.SHADOW_BAN.key
        .replace('{guildId}', guildId)
        .replace('{userId}', authorId),
      shadowBan,
      CACHE_KEYS.SHADOW_BAN.ttl,
    );

    return shadowBan;
  }
}
