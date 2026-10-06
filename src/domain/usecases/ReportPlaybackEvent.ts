import type { AnalyticsService, PlaybackEvent } from '../services/AnalyticsService';
import type { CrashReporter } from '../services/CrashReporter';

export class PlaybackError extends Error {
  constructor(
    readonly streamId: string,
    message: string,
  ) {
    super(`[${streamId}] ${message}`);
    this.name = 'PlaybackError';
  }
}

export class ReportPlaybackEvent {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly crashReporter: CrashReporter,
  ) {}

  execute(event: PlaybackEvent): void {
    this.analytics.track(event);
    this.crashReporter.log(`${event.name} ${JSON.stringify(event.params)}`);

    if (event.name === 'playback_start') {
      this.crashReporter.setAttribute('last_stream_id', event.params.stream_id);
    }
    if (event.name === 'playback_error') {
      this.crashReporter.recordError(
        new PlaybackError(event.params.stream_id, event.params.message),
      );
    }
  }
}
