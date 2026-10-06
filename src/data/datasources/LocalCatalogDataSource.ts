import type { CatalogDataSource } from './CatalogDataSource';
import seed from './catalog.json';

export class LocalCatalogDataSource implements CatalogDataSource {
  readonly name = 'Local (JSON embebido)';

  constructor(private readonly latencyMs = 600) {}

  async fetchStreams(): Promise<unknown> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return seed;
  }
}
