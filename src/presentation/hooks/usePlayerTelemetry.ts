import { useEvent, useEventListener } from 'expo';
import type { AudioTrack, SubtitleTrack, VideoPlayer, VideoTrack } from 'expo-video';
import { useState } from 'react';

export function usePlayerTelemetry(player: VideoPlayer) {
  const time = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    bufferedPosition: player.bufferedPosition,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
  });
  const { videoTrack } = useEvent(player, 'videoTrackChange', { videoTrack: player.videoTrack });
  const { audioTrack } = useEvent(player, 'audioTrackChange', { audioTrack: player.audioTrack });
  const { subtitleTrack } = useEvent(player, 'subtitleTrackChange', {
    subtitleTrack: player.subtitleTrack,
  });

  const [duration, setDuration] = useState(player.duration);
  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);

  useEventListener(player, 'sourceLoad', (payload) => {
    setDuration(payload.duration);
    setVideoTracks(payload.availableVideoTracks);
    setAudioTracks(payload.availableAudioTracks);
    setSubtitleTracks(payload.availableSubtitleTracks);
  });

  useEventListener(player, 'availableAudioTracksChange', ({ availableAudioTracks }) => {
    setAudioTracks(availableAudioTracks);
  });

  useEventListener(player, 'availableSubtitleTracksChange', ({ availableSubtitleTracks }) => {
    setSubtitleTracks(availableSubtitleTracks);
  });

  return {
    currentTime: time.currentTime,
    offsetFromLive: time.currentOffsetFromLive,
    bufferAhead: Math.max(0, time.bufferedPosition - time.currentTime),
    duration,
    videoTrack,
    audioTrack,
    subtitleTrack,
    videoTracks,
    audioTracks,
    subtitleTracks,
  };
}

export type PlayerTelemetry = ReturnType<typeof usePlayerTelemetry>;

export function selectAudioTrack(player: VideoPlayer, track: AudioTrack) {
  player.audioTrack = track;
}

export function selectSubtitleTrack(player: VideoPlayer, track: SubtitleTrack | null) {
  player.subtitleTrack = track;
}
