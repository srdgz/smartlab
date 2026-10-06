import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { PlaybackPhase, PlaybackSession } from '../../../domain/entities/PlaybackSession';
import type { PlayerTelemetry } from '../../hooks/usePlayerTelemetry';
import { formatBitrate, formatMs, formatTime } from '../../format';
import { colors, gradients, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { MetricTile } from '../molecules/MetricTile';

interface PlaybackInsightsProps {
  session: PlaybackSession;
  telemetry: PlayerTelemetry;
  isLive: boolean;
  columns?: number;
}

const PHASE: Record<PlaybackPhase, { label: string; color: string }> = {
  loading: { label: 'Loading', color: colors.warning },
  playing: { label: 'Playing', color: colors.success },
  paused: { label: 'Paused', color: colors.textMuted },
  buffering: { label: 'Rebuffering', color: colors.warning },
  error: { label: 'Error', color: colors.danger },
  ended: { label: 'Ended', color: colors.textMuted },
};

function bitrateOf(track: PlayerTelemetry['videoTrack']) {
  return track?.averageBitrate ?? track?.peakBitrate ?? null;
}

export function PlaybackInsights({
  session,
  telemetry,
  isLive,
  columns = 2,
}: PlaybackInsightsProps) {
  const { videoTrack } = telemetry;
  const phase = PHASE[session.phase];
  const ladder = [...telemetry.videoTracks]
    .filter((track) => bitrateOf(track))
    .sort((a, b) => (bitrateOf(b) ?? 0) - (bitrateOf(a) ?? 0));
  const maxBitrate = bitrateOf(ladder[0] ?? null) ?? 1;

  return (
    <View style={styles.container}>
      <View style={styles.status}>
        <View style={[styles.dot, { backgroundColor: phase.color }]} />
        <AppText variant="bodyStrong">{phase.label}</AppText>
        <AppText variant="caption" tone="subtle" style={styles.codec} numberOfLines={1}>
          {videoTrack?.mimeType ?? ''}
        </AppText>
      </View>

      <View style={styles.grid}>
        <MetricTile
          icon="flash-outline"
          label="Startup"
          hint="TTFF"
          columns={columns}
          value={formatMs(session.startupMs)}
          accent={colors.primary}
        />
        <MetricTile
          icon="hourglass-outline"
          label="Rebuffers"
          columns={columns}
          hint={formatMs(session.rebufferMs)}
          value={String(session.rebufferCount)}
          accent={session.rebufferCount > 0 ? colors.warning : colors.success}
        />
        <MetricTile
          icon="tv-outline"
          label="Resolution"
          columns={columns}
          value={videoTrack ? `${videoTrack.size.height}p` : '—'}
          hint={videoTrack ? `${videoTrack.size.width}×${videoTrack.size.height}` : undefined}
          accent={colors.cyan}
        />
        <MetricTile
          icon="speedometer-outline"
          label="Bitrate"
          columns={columns}
          value={formatBitrate(bitrateOf(videoTrack))}
          accent={colors.cyan}
        />
        <MetricTile
          icon="layers-outline"
          label="Buffer ahead"
          columns={columns}
          value={`${telemetry.bufferAhead.toFixed(1)} s`}
          accent={colors.success}
        />
        {isLive ? (
          <MetricTile
            icon="radio-outline"
            label="Live latency"
            columns={columns}
            value={
              telemetry.offsetFromLive !== null ? `${telemetry.offsetFromLive.toFixed(1)} s` : '—'
            }
            accent={colors.live}
          />
        ) : (
          <MetricTile
            icon="time-outline"
            label="Position"
            columns={columns}
            value={formatTime(telemetry.currentTime)}
            hint={formatTime(telemetry.duration)}
            accent={colors.textMuted}
          />
        )}
      </View>

      {ladder.length > 0 && (
        <View style={styles.ladder}>
          <AppText variant="overline" tone="muted" uppercase>
            ABR ladder · {ladder.length} renditions
          </AppText>
          {ladder.map((track) => {
            const active = videoTrack?.id === track.id;
            const ratio = Math.max(0.06, (bitrateOf(track) ?? 0) / maxBitrate);
            return (
              <View key={track.id} style={styles.rung}>
                <AppText
                  variant="caption"
                  tone={active ? 'default' : 'subtle'}
                  style={styles.rungLabel}
                >
                  {track.size.height}p
                </AppText>
                <View style={styles.barTrack}>
                  {active ? (
                    <LinearGradient
                      colors={gradients.brand}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.bar, { width: `${ratio * 100}%` }]}
                    />
                  ) : (
                    <View style={[styles.bar, styles.barIdle, { width: `${ratio * 100}%` }]} />
                  )}
                </View>
                <AppText
                  variant="caption"
                  tone={active ? 'default' : 'subtle'}
                  style={styles.rungValue}
                >
                  {formatBitrate(bitrateOf(track))}
                </AppText>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  codec: { flex: 1, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ladder: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rung: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rungLabel: { width: 48, fontVariant: ['tabular-nums'] },
  rungValue: { width: 76, textAlign: 'right', fontVariant: ['tabular-nums'] },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 4 },
  barIdle: { backgroundColor: colors.borderStrong },
});
