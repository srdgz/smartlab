import type { CatalogDataSource } from './CatalogDataSource';
import seed from './catalog.json';

export class LocalCatalogDataSource implements CatalogDataSource {
  readonly name = 'Local (bundled JSON)';

  constructor(private readonly latencyMs = 600) {}

  async fetchStreams(): Promise<unknown> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return seed;
  }
}
