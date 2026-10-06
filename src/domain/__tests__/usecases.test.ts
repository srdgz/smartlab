import { aStream } from '../../test/fixtures';
import { isStreamSupported } from '../entities/Stream';
import { StreamNotFoundError } from '../errors/CatalogError';
import type { CatalogRepository } from '../repositories/CatalogRepository';
import type { AnalyticsService } from '../services/AnalyticsService';
import type { CrashReporter } from '../services/CrashReporter';
import { GetCatalog } from '../usecases/GetCatalog';
import { GetStream } from '../usecases/GetStream';
import { PlaybackError, ReportPlaybackEvent } from '../usecases/ReportPlaybackEvent';

function repositoryWith(streams = [aStream()]) {
  const repository = {
    source: 'test',
    getStreams: jest.fn().mockResolvedValue(streams),
    getStream: jest.fn(async (id: string) => streams.find((s) => s.id === id)),
  } satisfies CatalogRepository;
  return repository;
}

describe('GetCatalog', () => {
  it('groups streams into featured, live, vod and lab sections', async () => {
    const repository = repositoryWith([
      aStream({ id: 'hero', featured: true }),
      aStream({ id: 'live', category: 'live', isLive: true }),
      aStream({ id: 'dash', category: 'lab', format: 'dash' }),
    ]);

    const catalog = await new GetCatalog(repository).execute();

    expect(catalog.featured?.id).toBe('hero');
    expect(catalog.live.map((s) => s.id)).toEqual(['live']);
    expect(catalog.vod.map((s) => s.id)).toEqual(['hero']);
    expect(catalog.lab.map((s) => s.id)).toEqual(['dash']);
  });

  it('forwards pull-to-refresh as a forced reload', async () => {
    const repository = repositoryWith();
    await new GetCatalog(repository).execute({ refresh: true });

    expect(repository.getStreams).toHaveBeenCalledWith({ forceRefresh: true });
  });
});

describe('GetStream', () => {
  it('fails with a domain error when the stream does not exist', async () => {
    await expect(new GetStream(repositoryWith()).execute('missing')).rejects.toBeInstanceOf(
      StreamNotFoundError,
    );
  });
});

describe('ReportPlaybackEvent', () => {
  function setup() {
    const analytics = {
      provider: 'test',
      track: jest.fn(),
      screen: jest.fn(),
    } satisfies AnalyticsService;
    const crashReporter = {
      provider: 'test',
      canCrash: false,
      log: jest.fn(),
      setAttribute: jest.fn(),
      recordError: jest.fn(),
      crash: jest.fn(),
    } satisfies CrashReporter;
    return { analytics, crashReporter, useCase: new ReportPlaybackEvent(analytics, crashReporter) };
  }

  it('records playback failures as non-fatal errors', () => {
    const { analytics, crashReporter, useCase } = setup();
    const event = { name: 'playback_error', params: { stream_id: 'x', message: '404' } } as const;

    useCase.execute(event);

    expect(analytics.track).toHaveBeenCalledWith(event);
    expect(crashReporter.recordError).toHaveBeenCalledWith(expect.any(PlaybackError));
  });

  it('tags the crash context with the stream that started playing', () => {
    const { crashReporter, useCase } = setup();

    useCase.execute({ name: 'playback_start', params: { stream_id: 'tos', startup_ms: 800 } });

    expect(crashReporter.setAttribute).toHaveBeenCalledWith('last_stream_id', 'tos');
    expect(crashReporter.recordError).not.toHaveBeenCalled();
  });
});

describe('isStreamSupported', () => {
  it('blocks DASH on iOS because AVPlayer has no DASH support', () => {
    const dash = aStream({ format: 'dash' });
    expect(isStreamSupported(dash, 'ios')).toBe(false);
    expect(isStreamSupported(dash, 'android')).toBe(true);
  });

  it('honours an explicit platform allow-list', () => {
    expect(isStreamSupported(aStream({ platforms: ['android'] }), 'ios')).toBe(false);
    expect(isStreamSupported(aStream(), 'ios')).toBe(true);
  });
});
