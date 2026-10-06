import { buildCatalog, type Catalog } from '../entities/Catalog';
import type { CatalogRepository } from '../repositories/CatalogRepository';

export class GetCatalog {
  constructor(private readonly repository: CatalogRepository) {}

  async execute(options: { refresh?: boolean } = {}): Promise<Catalog> {
    return buildCatalog(await this.repository.getStreams({ forceRefresh: options.refresh }));
  }
}
