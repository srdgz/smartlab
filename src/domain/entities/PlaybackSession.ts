import type { PlaybackEvent } from '../services/AnalyticsService';

export type PlaybackPhase = 'loading' | 'playing' | 'paused' | 'buffering' | 'error' | 'ended';

export interface PlaybackSession {
  streamId: string;
  phase: PlaybackPhase;
  loadStartedAt: number;
  startupMs: number | null;
  rebufferCount: number;
  rebufferMs: number;
  bufferingSince: number | null;
  errorMessage: string | null;
}

export type PlayerSignal =
  | { type: 'status'; status: 'idle' | 'loading' | 'readyToPlay' | 'error'; at: number; error?: string }
  | { type: 'playing'; isPlaying: boolean; at: number }
  | { type: 'ended'; at: number }
  | { type: 'reset'; at: number };

export interface SessionTransition {
  session: PlaybackSession;
  events: PlaybackEvent[];
}

export function startSession(streamId: string, at: number): PlaybackSession {
  return {
    streamId,
    phase: 'loading',
    loadStartedAt: at,
    startupMs: null,
    rebufferCount: 0,
    rebufferMs: 0,
    bufferingSince: null,
    errorMessage: null,
  };
}

export function advanceSession(session: PlaybackSession, signal: PlayerSignal): SessionTransition {
  const stream_id = session.streamId;
  const hasStarted = session.startupMs !== null;

  switch (signal.type) {
    case 'reset':
      return { session: startSession(stream_id, signal.at), events: [] };

    case 'status': {
      if (signal.status === 'error') {
        const message = signal.error ?? 'Error desconocido';
        return {
          session: { ...session, phase: 'error', errorMessage: message, bufferingSince: null },
          events: [{ name: 'playback_error', params: { stream_id, message } }],
        };
      }
      if (signal.status === 'loading' && hasStarted && session.phase !== 'buffering') {
        const rebufferCount = session.rebufferCount + 1;
        return {
          session: { ...session, phase: 'buffering', bufferingSince: signal.at, rebufferCount },
          events: [{ name: 'playback_rebuffer', params: { stream_id, count: rebufferCount } }],
        };
      }
      if (signal.status === 'readyToPlay' && session.bufferingSince !== null) {
        const duration_ms = signal.at - session.bufferingSince;
        return {
          session: {
            ...session,
            phase: 'playing',
            bufferingSince: null,
            rebufferMs: session.rebufferMs + duration_ms,
          },
          events: [{ name: 'playback_rebuffer_end', params: { stream_id, duration_ms } }],
        };
      }
      return { session, events: [] };
    }

    case 'playing': {
      if (session.phase === 'error') return { session, events: [] };
      if (signal.isPlaying && !hasStarted) {
        const startup_ms = signal.at - session.loadStartedAt;
        return {
          session: { ...session, phase: 'playing', startupMs: startup_ms },
          events: [{ name: 'playback_start', params: { stream_id, startup_ms } }],
        };
      }
      if (session.phase === 'buffering') return { session, events: [] };
      return { session: { ...session, phase: signal.isPlaying ? 'playing' : 'paused' }, events: [] };
    }

    case 'ended':
      return {
        session: { ...session, phase: 'ended', bufferingSince: null },
        events: [{ name: 'playback_end', params: { stream_id } }],
      };
  }
}
