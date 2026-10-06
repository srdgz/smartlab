import { CatalogError } from '../../domain/errors/CatalogError';
import type { CatalogDataSource } from '../datasources/CatalogDataSource';
import { RemoteCatalogDataSource } from '../datasources/RemoteCatalogDataSource';
import seed from '../datasources/catalog.json';
import { toStreams } from '../mappers/streamMapper';
import { CatalogRepositoryImpl } from '../repositories/CatalogRepositoryImpl';

const dto = {
  id: 'bbb',
  title: 'Big Buck Bunny',
  description: 'VOD',
  url: 'https://example.com/master.m3u8',
  format: 'hls',
};

function fakeFetch(response: Partial<Response>) {
  return jest.fn().mockResolvedValue({ ok: true, status: 200, ...response }) as unknown as typeof fetch;
}

function sourceReturning(payload: unknown) {
  return { name: 'fake', fetchStreams: jest.fn().mockResolvedValue(payload) } satisfies CatalogDataSource;
}

describe('streamMapper', () => {
  it('drops entries that break the contract and fills defaults', () => {
    const streams = toStreams([dto, { id: 'x' }, { ...dto, id: 'y', format: 'mp4' }]);

    expect(streams).toHaveLength(1);
    expect(streams[0]).toMatchObject({
      id: 'bbb',
      category: 'vod',
      isLive: false,
      featured: false,
      tags: [],
    });
    expect(streams[0].artwork.colors).toHaveLength(2);
  });

  it('classifies live streams without an explicit category', () => {
    expect(toStreams([{ ...dto, live: true }])[0].category).toBe('live');
  });

  it('rejects payloads that are not a list', () => {
    expect(() => toStreams({ items: [] })).toThrow(CatalogError);
  });

  it('accepts every entry of the bundled catalog', () => {
    expect(toStreams(seed)).toHaveLength(seed.length);
  });
});

describe('RemoteCatalogDataSource', () => {
  it('surfaces HTTP failures with their status code', async () => {
    const source = new RemoteCatalogDataSource('https://api.test', fakeFetch({ ok: false, status: 503 }));

    await expect(source.fetchStreams()).rejects.toMatchObject({ status: 503 });
  });

  it('maps network failures to a readable error', async () => {
    const fetcher = jest
      .fn()
      .mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;

    await expect(new RemoteCatalogDataSource('https://api.test', fetcher).fetchStreams()).rejects.toThrow(
      'No se pudo conectar con el servidor',
    );
  });
});

describe('CatalogRepositoryImpl', () => {
  it('caches the catalog and deduplicates concurrent requests', async () => {
    const source = sourceReturning([dto]);
    const repository = new CatalogRepositoryImpl(source);

    await Promise.all([repository.getStreams(), repository.getStream('bbb')]);
    await repository.getStreams();

    expect(source.fetchStreams).toHaveBeenCalledTimes(1);
  });

  it('bypasses the cache on forced refresh', async () => {
    const source = sourceReturning([dto]);
    const repository = new CatalogRepositoryImpl(source);

    await repository.getStreams();
    await repository.getStreams({ forceRefresh: true });

    expect(source.fetchStreams).toHaveBeenCalledTimes(2);
  });
});
