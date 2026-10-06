import type { Stream } from './Stream';

export interface Catalog {
  featured: Stream | null;
  live: Stream[];
  vod: Stream[];
  lab: Stream[];
}

export function buildCatalog(streams: Stream[]): Catalog {
  return {
    featured: streams.find((stream) => stream.featured) ?? null,
    live: streams.filter((stream) => stream.category === 'live'),
    vod: streams.filter((stream) => stream.category === 'vod'),
    lab: streams.filter((stream) => stream.category === 'lab'),
  };
}
