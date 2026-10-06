import type { Stream } from '../entities/Stream';
import { StreamNotFoundError } from '../errors/CatalogError';
import type { CatalogRepository } from '../repositories/CatalogRepository';

export class GetStream {
  constructor(private readonly repository: CatalogRepository) {}

  async execute(id: string): Promise<Stream> {
    const stream = await this.repository.getStream(id);
    if (!stream) throw new StreamNotFoundError(id);
    return stream;
  }
}
