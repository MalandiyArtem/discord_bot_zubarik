export interface ITenorResponse {
  results: IGif[];
  next: string;
}

interface IGif {
  id: string;
  title: string;
  media_formats: unknown;
  created: number;
  content_description: string;
  itemurl: string;
  url: string;
  tags: unknown[];
  flags: unknown[];
  hasaudio: boolean;
}
