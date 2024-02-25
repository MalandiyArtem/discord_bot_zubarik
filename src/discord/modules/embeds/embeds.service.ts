import { Injectable } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class EmbedsService {
  public getAddEmbed() {
    return new EmbedBuilder()
      .setColor('Green')
      .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .setTimestamp()
      .setFooter({ text: 'Big Brother is always watching you' });
  }

  public getUpdateEmbed() {
    return new EmbedBuilder()
      .setColor('Yellow')
      .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .setTimestamp()
      .setFooter({ text: 'Big Brother is always watching you' });
  }

  public getRemoveEmbed() {
    return new EmbedBuilder()
      .setColor('Red')
      .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .setTimestamp()
      .setFooter({ text: 'Big Brother is always watching you' });
  }
}
