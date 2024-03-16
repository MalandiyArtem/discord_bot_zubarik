export const CACHE_KEYS = {
  GUILD_LOG_CHANNEL: {
    key: '{guildId}_log_channel',
    ttl: 86400000, // one day
  },
  SHADOW_BAN: {
    key: '{guildId}_{userId}_shadow_ban',
    ttl: 10800000, // 3 hours
  },
};
