import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TenorGifService {
  private readonly TENOR_TOKEN: string;

  constructor() {
    const tenor_token = process.env['TENOR_TOKEN'];

    if (!tenor_token) {
      throw new Error('Can not get tenor token');
    }

    this.TENOR_TOKEN = tenor_token;
  }

  public async getRandomGif(
    prompt: string | undefined,
  ): Promise<string | null> {
    if (!prompt) {
      return Promise.resolve(null);
    }

    try {
      const url = `https://tenor.googleapis.com/v2/search?key=${this.TENOR_TOKEN}&q=${prompt}&random=true&limit=1`;
      const response = await axios.get(url);

      return response.data.results[0].url;
    } catch (error) {
      console.error('Error while fetching gif:', error);
      return Promise.resolve(null);
    }
  }
}
