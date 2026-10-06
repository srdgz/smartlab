import {
  advanceSession,
  startSession,
  type PlaybackSession,
  type PlayerSignal,
} from '../entities/PlaybackSession';

function run(signals: PlayerSignal[], start = startSession('s1', 0)) {
  return signals.reduce<{ session: PlaybackSession; events: string[] }>(
    (acc, signal) => {
      const result = advanceSession(acc.session, signal);
      return { session: result.session, events: [...acc.events, ...result.events.map((e) => e.name)] };
    },
    { session: start, events: [] },
  );
}

describe('advanceSession', () => {
  it('measures startup time until the first frame plays', () => {
    const { session, events } = run([
      { type: 'status', status: 'loading', at: 100 },
      { type: 'status', status: 'readyToPlay', at: 900 },
      { type: 'playing', isPlaying: true, at: 1200 },
    ]);

    expect(session.startupMs).toBe(1200);
    expect(session.phase).toBe('playing');
    expect(events).toEqual(['playback_start']);
  });

  it('counts a rebuffer only after playback started and accumulates its duration', () => {
    const { session, events } = run([
      { type: 'playing', isPlaying: true, at: 500 },
      { type: 'status', status: 'loading', at: 2000 },
      { type: 'status', status: 'loading', at: 2100 },
      { type: 'status', status: 'readyToPlay', at: 2750 },
    ]);

    expect(session.rebufferCount).toBe(1);
    expect(session.rebufferMs).toBe(750);
    expect(events).toEqual(['playback_start', 'playback_rebuffer', 'playback_rebuffer_end']);
  });

  it('does not treat the initial load as a rebuffer', () => {
    const { session } = run([{ type: 'status', status: 'loading', at: 10 }]);

    expect(session.rebufferCount).toBe(0);
    expect(session.phase).toBe('loading');
  });

  it('keeps the error until the session is reset', () => {
    const { session, events } = run([
      { type: 'status', status: 'error', error: 'HTTP 404', at: 300 },
      { type: 'playing', isPlaying: false, at: 310 },
    ]);

    expect(session.phase).toBe('error');
    expect(session.errorMessage).toBe('HTTP 404');
    expect(events).toEqual(['playback_error']);
    expect(advanceSession(session, { type: 'reset', at: 1000 }).session).toEqual(
      startSession('s1', 1000),
    );
  });

  it('distinguishes pause from playback end', () => {
    const paused = run([
      { type: 'playing', isPlaying: true, at: 100 },
      { type: 'playing', isPlaying: false, at: 200 },
    ]);
    expect(paused.session.phase).toBe('paused');

    const ended = run([{ type: 'ended', at: 300 }], paused.session);
    expect(ended.session.phase).toBe('ended');
    expect(ended.events).toEqual(['playback_end']);
  });
});
