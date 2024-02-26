import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

export type UpdateEmbedOnEmptyRecordsType = {
  reason: 'delete' | 'request';
  interaction?: ChatInputCommandInteraction<CacheType>;
  btnInteraction?: ButtonInteraction<CacheType>;
  title: string;
  embed: EmbedBuilder;
};
