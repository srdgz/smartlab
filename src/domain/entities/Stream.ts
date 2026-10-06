export type StreamFormat = 'hls' | 'dash';

export type StreamCategory = 'live' | 'vod' | 'lab';

export type AppPlatform = 'ios' | 'android' | 'web';

export interface StreamArtwork {
  poster?: string;
  backdrop?: string;
  colors: [string, string];
}

export interface Stream {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  format: StreamFormat;
  category: StreamCategory;
  isLive: boolean;
  featured: boolean;
  tags: string[];
  artwork: StreamArtwork;
  platforms?: AppPlatform[];
}

export function isStreamSupported(stream: Stream, platform: string): boolean {
  if (stream.platforms && !stream.platforms.includes(platform as AppPlatform)) {
    return false;
  }
  return !(stream.format === 'dash' && platform === 'ios');
}
