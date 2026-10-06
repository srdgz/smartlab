import { useEventListener } from 'expo';
import type { VideoPlayer } from 'expo-video';
import { useCallback, useRef, useState } from 'react';

import {
  advanceSession,
  startSession,
  type PlaybackSession,
  type PlayerSignal,
} from '../../domain/entities/PlaybackSession';
import type { ReportPlaybackEvent } from '../../domain/usecases/ReportPlaybackEvent';

export function usePlaybackSession(
  player: VideoPlayer,
  streamId: string,
  reportPlaybackEvent: ReportPlaybackEvent,
) {
  const [session, setSession] = useState<PlaybackSession>(() => startSession(streamId, Date.now()));
  const sessionRef = useRef(session);

  const dispatch = useCallback(
    (signal: PlayerSignal) => {
      const transition = advanceSession(sessionRef.current, signal);
      sessionRef.current = transition.session;
      transition.events.forEach((event) => reportPlaybackEvent.execute(event));
      setSession(transition.session);
    },
    [reportPlaybackEvent],
  );

  useEventListener(player, 'statusChange', ({ status, error }) => {
    dispatch({ type: 'status', status, error: error?.message, at: Date.now() });
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    dispatch({ type: 'playing', isPlaying, at: Date.now() });
  });

  useEventListener(player, 'playToEnd', () => {
    dispatch({ type: 'ended', at: Date.now() });
  });

  const reset = useCallback(() => dispatch({ type: 'reset', at: Date.now() }), [dispatch]);

  return { session, reset };
}
