import type { Stream } from '../domain/entities/Stream';

export function aStream(overrides: Partial<Stream> = {}): Stream {
  return {
    id: 'stream',
    title: 'Stream',
    subtitle: '',
    description: '',
    url: 'https://example.com/master.m3u8',
    format: 'hls',
    category: 'vod',
    isLive: false,
    featured: false,
    tags: [],
    artwork: { colors: ['#000000', '#FFFFFF'] },
    ...overrides,
  };
}
