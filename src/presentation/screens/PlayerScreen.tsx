import { router } from 'expo-router';
import { useVideoPlayer, type VideoSource } from 'expo-video';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getContainer } from '../../di/container';
import type { Stream } from '../../domain/entities/Stream';
import { AppText } from '../components/atoms/AppText';
import { Badge } from '../components/atoms/Badge';
import { IconButton } from '../components/atoms/IconButton';
import { SegmentedControl } from '../components/molecules/SegmentedControl';
import { StatusMessage } from '../components/molecules/StatusMessage';
import { PlaybackInsights } from '../components/organisms/PlaybackInsights';
import { TrackPanel } from '../components/organisms/TrackPanel';
import { VideoStage } from '../components/organisms/VideoStage';
import { useAsync } from '../hooks/useAsync';
import { usePlaybackSession } from '../hooks/usePlaybackSession';
import {
  selectAudioTrack,
  selectSubtitleTrack,
  usePlayerTelemetry,
} from '../hooks/usePlayerTelemetry';
import { colors, spacing } from '../theme/tokens';

type Tab = 'insights' | 'tracks';

function toVideoSource(stream: Stream): VideoSource {
  return {
    uri: stream.url,
    contentType: stream.format,
    metadata: { title: stream.title, artist: 'StreamLab' },
  };
}

function TopBar({ title }: { title?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
      <IconButton
        icon="chevron-back"
        size={36}
        accessibilityLabel="Volver"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <AppText variant="bodyStrong" numberOfLines={1} style={styles.topTitle}>
        {title ?? ''}
      </AppText>
      <View style={styles.topSpacer} />
    </View>
  );
}

function PlayerContent({ stream }: { stream: Stream }) {
  const insets = useSafeAreaInsets();
  const { reportPlaybackEvent, analytics } = getContainer();
  const source = useMemo(() => toVideoSource(stream), [stream]);
  const player = useVideoPlayer(source, (p) => {
    p.timeUpdateEventInterval = 1;
    p.showNowPlayingNotification = true;
    p.play();
  });
  const { session, reset } = usePlaybackSession(player, stream.id, reportPlaybackEvent);
  const telemetry = usePlayerTelemetry(player);
  const [tab, setTab] = useState<Tab>('insights');

  const retry = async () => {
    reset();
    await player.replaceAsync(source);
    player.play();
  };

  return (
    <>
      <TopBar title={stream.title} />
      <VideoStage player={player} session={session} onRetry={retry} />
      <ScrollView contentContainerStyle={[styles.details, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <View style={styles.badges}>
          {stream.isLive ? <Badge label="En directo" tone="live" /> : <Badge label="VOD" tone="glass" />}
          <Badge label={stream.format} tone="primary" />
          {stream.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
        <View style={styles.titleBlock}>
          <AppText variant="title">{stream.title}</AppText>
          <AppText variant="caption" tone="subtle">
            {stream.subtitle}
          </AppText>
        </View>
        <AppText variant="body" tone="muted">
          {stream.description}
        </AppText>

        <SegmentedControl<Tab>
          segments={[
            { key: 'insights', label: 'Rendimiento' },
            { key: 'tracks', label: 'Audio y subtítulos' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'insights' ? (
          <PlaybackInsights session={session} telemetry={telemetry} isLive={stream.isLive} />
        ) : (
          <TrackPanel
            telemetry={telemetry}
            onSelectAudio={(track) => {
              selectAudioTrack(player, track);
              analytics.track({
                name: 'track_change',
                params: { stream_id: stream.id, kind: 'audio', language: track.language },
              });
            }}
            onSelectSubtitle={(track) => {
              selectSubtitleTrack(player, track);
              analytics.track({
                name: 'track_change',
                params: { stream_id: stream.id, kind: 'subtitle', language: track?.language ?? 'off' },
              });
            }}
          />
        )}
      </ScrollView>
    </>
  );
}

export function PlayerScreen({ id }: { id: string }) {
  const { getStream, analytics } = getContainer();
  const load = useCallback(() => getStream.execute(id), [getStream, id]);
  const { state, retry } = useAsync(load);

  useEffect(() => {
    analytics.screen('player');
  }, [analytics]);

  return (
    <View style={styles.screen}>
      {state.status === 'success' ? (
        <PlayerContent stream={state.data} />
      ) : (
        <>
          <TopBar />
          {state.status === 'loading' ? (
            <View style={styles.placeholder} />
          ) : (
            <StatusMessage
              icon="film-outline"
              title="Contenido no disponible"
              message={state.error.message}
              actionLabel="Reintentar"
              onAction={retry}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.black,
  },
  topTitle: { flex: 1, textAlign: 'center' },
  topSpacer: { width: 36 },
  placeholder: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.black },
  details: { padding: spacing.lg, gap: spacing.lg },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  titleBlock: { gap: spacing.xs },
});
