import { CatalogError } from '../../domain/errors/CatalogError';
import type { CatalogDataSource } from './CatalogDataSource';

export class RemoteCatalogDataSource implements CatalogDataSource {
  readonly name: string;

  constructor(
    private readonly url: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs = 8000,
  ) {
    this.name = `REST (${url})`;
  }

  async fetchStreams(): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetcher(this.url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new CatalogError(
          `The server responded with an error (${response.status})`,
          response.status,
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof CatalogError) throw error;
      throw new CatalogError('Could not reach the server');
    } finally {
      clearTimeout(timer);
    }
  }
}
