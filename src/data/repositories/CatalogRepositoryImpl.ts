import type { Stream } from '../../domain/entities/Stream';
import type { CatalogRepository } from '../../domain/repositories/CatalogRepository';
import type { CatalogDataSource } from '../datasources/CatalogDataSource';
import { toStreams } from '../mappers/streamMapper';

export class CatalogRepositoryImpl implements CatalogRepository {
  private cache: Stream[] | null = null;
  private pending: Promise<Stream[]> | null = null;

  constructor(private readonly dataSource: CatalogDataSource) {}

  get source(): string {
    return this.dataSource.name;
  }

  async getStreams(options: { forceRefresh?: boolean } = {}): Promise<Stream[]> {
    if (options.forceRefresh) this.cache = null;
    if (this.cache) return this.cache;
    if (!this.pending) {
      this.pending = this.dataSource
        .fetchStreams()
        .then(toStreams)
        .then((streams) => {
          this.cache = streams;
          return streams;
        })
        .finally(() => {
          this.pending = null;
        });
    }
    return this.pending;
  }

  async getStream(id: string): Promise<Stream | undefined> {
    const streams = await this.getStreams();
    return streams.find((stream) => stream.id === id);
  }
}
