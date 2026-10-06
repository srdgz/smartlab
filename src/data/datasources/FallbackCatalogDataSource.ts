import type { CatalogDataSource } from './CatalogDataSource';

export class FallbackCatalogDataSource implements CatalogDataSource {
  private usingFallback = false;

  constructor(
    private readonly primary: CatalogDataSource,
    private readonly fallback: CatalogDataSource,
  ) {}

  get name(): string {
    return this.usingFallback ? `${this.fallback.name} · offline fallback` : this.primary.name;
  }

  async fetchStreams(): Promise<unknown> {
    try {
      const payload = await this.primary.fetchStreams();
      this.usingFallback = false;
      return payload;
    } catch {
      this.usingFallback = true;
      return this.fallback.fetchStreams();
    }
  }
}
