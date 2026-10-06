import type { AudioTrack, SubtitleTrack } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { formatLanguage } from '../../format';
import type { PlayerTelemetry } from '../../hooks/usePlayerTelemetry';
import { spacing } from '../../theme/tokens';
import { OptionGroup, type Option } from '../molecules/OptionGroup';

interface TrackPanelProps {
  telemetry: PlayerTelemetry;
  onSelectAudio: (track: AudioTrack) => void;
  onSelectSubtitle: (track: SubtitleTrack | null) => void;
}

function trackKey(track: { id?: string; language: string }, index: number) {
  return track.id ?? `${track.language}-${index}`;
}

function sameTrack(
  a: { id?: string; language: string } | null,
  b: { id?: string; language: string } | null,
) {
  if (!a || !b) return false;
  return a.id !== undefined && b.id !== undefined ? a.id === b.id : a.language === b.language;
}

export function TrackPanel({ telemetry, onSelectAudio, onSelectSubtitle }: TrackPanelProps) {
  const audioOptions: Option<AudioTrack>[] = telemetry.audioTracks.map((track, index) => ({
    key: trackKey(track, index),
    label: track.label || formatLanguage(track.language, `Track ${index + 1}`),
    value: track,
  }));

  const subtitleOptions: Option<SubtitleTrack | null>[] = [
    { key: 'off', label: 'Off', value: null },
    ...telemetry.subtitleTracks.map((track, index) => ({
      key: trackKey(track, index),
      label: track.label || formatLanguage(track.language, `Subtitle ${index + 1}`),
      value: track,
    })),
  ];

  const selectedAudio = audioOptions.find((option) =>
    sameTrack(option.value, telemetry.audioTrack),
  );
  const selectedSubtitle = telemetry.subtitleTrack
    ? subtitleOptions.find((option) => sameTrack(option.value, telemetry.subtitleTrack))
    : subtitleOptions[0];

  return (
    <View style={styles.container}>
      <OptionGroup
        title="Audio"
        icon="musical-notes-outline"
        options={audioOptions.length > 1 ? audioOptions : []}
        selectedKey={selectedAudio?.key ?? null}
        onSelect={(option) => onSelectAudio(option.value)}
        emptyLabel={
          audioOptions.length === 1
            ? `Single track: ${audioOptions[0].label}`
            : 'Single audio track'
        }
      />
      <OptionGroup
        title="Subtitles"
        icon="chatbox-ellipses-outline"
        options={subtitleOptions.length > 1 ? subtitleOptions : []}
        selectedKey={selectedSubtitle?.key ?? null}
        onSelect={(option) => onSelectSubtitle(option.value)}
        emptyLabel="This stream does not declare subtitles in its manifest"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl },
});
