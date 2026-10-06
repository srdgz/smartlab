export type PlaybackEvent =
  | { name: 'playback_start'; params: { stream_id: string; startup_ms: number } }
  | { name: 'playback_rebuffer'; params: { stream_id: string; count: number } }
  | { name: 'playback_rebuffer_end'; params: { stream_id: string; duration_ms: number } }
  | { name: 'playback_error'; params: { stream_id: string; message: string } }
  | { name: 'playback_end'; params: { stream_id: string } };

export type AnalyticsEvent =
  | PlaybackEvent
  | { name: 'open_stream'; params: { stream_id: string; category: string } }
  | {
      name: 'track_change';
      params: { stream_id: string; kind: 'audio' | 'subtitle'; language: string };
    }
  | { name: 'diagnostics_test'; params: { source: string } };

export interface AnalyticsService {
  readonly provider: string;
  track(event: AnalyticsEvent): void;
  screen(name: string): void;
}
