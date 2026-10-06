import type { Stream } from '../entities/Stream';

export interface CatalogRepository {
  readonly source: string;
  getStreams(options?: { forceRefresh?: boolean }): Promise<Stream[]>;
  getStream(id: string): Promise<Stream | undefined>;
}
