import { router } from 'expo-router';
import { useVideoPlayer, type VideoSource } from 'expo-video';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
import { useLayout } from '../hooks/useLayout';
import { usePlaybackSession } from '../hooks/usePlaybackSession';
import {
  selectAudioTrack,
  selectSubtitleTrack,
  usePlayerTelemetry,
} from '../hooks/usePlayerTelemetry';
import { colors, spacing } from '../theme/tokens';

type Tab = 'insights' | 'tracks';

const TOP_BAR_HEIGHT = 52;

function toVideoSource(stream: Stream): VideoSource {
  return {
    uri: stream.url,
    contentType: stream.format,
    metadata: { title: stream.title, artist: 'StreamLab' },
  };
}

function TopBar({ title }: { title?: string }) {
  const { insets, gutter } = useLayout();
  return (
    <View
      style={[
        styles.topBar,
        {
          paddingTop: insets.top + spacing.xs,
          paddingLeft: insets.left + gutter,
          paddingRight: insets.right + gutter,
        },
      ]}
    >
      <IconButton
        icon="chevron-back"
        size={36}
        accessibilityLabel="Back"
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
  const { width, height, insets, gutter, splitPlayer, breakpoint } = useLayout();
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

  const availableHeight = height - insets.top - insets.bottom - TOP_BAR_HEIGHT;
  const videoWidth = splitPlayer
    ? Math.min((width - insets.left - insets.right) * 0.6, (availableHeight * 16) / 9)
    : width;
  const columns = splitPlayer || breakpoint === 'compact' ? 2 : 3;

  const details = (
    <ScrollView
      style={splitPlayer ? styles.sidePanel : undefined}
      contentContainerStyle={[
        styles.details,
        {
          paddingLeft: (splitPlayer ? 0 : insets.left) + gutter,
          paddingRight: insets.right + gutter,
          paddingBottom: insets.bottom + spacing.xxl,
        },
      ]}
    >
      <View style={styles.badges}>
        {stream.isLive ? <Badge label="Live" tone="live" /> : <Badge label="VOD" tone="glass" />}
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
          { key: 'insights', label: 'Performance' },
          { key: 'tracks', label: 'Audio & subtitles' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'insights' ? (
        <PlaybackInsights
          session={session}
          telemetry={telemetry}
          isLive={stream.isLive}
          columns={columns}
        />
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
              params: {
                stream_id: stream.id,
                kind: 'subtitle',
                language: track?.language ?? 'off',
              },
            });
          }}
        />
      )}
    </ScrollView>
  );

  return (
    <>
      <TopBar title={stream.title} />
      {splitPlayer ? (
        <View style={styles.split}>
          <View style={{ width: videoWidth, paddingLeft: insets.left, paddingTop: spacing.sm }}>
            <VideoStage player={player} session={session} onRetry={retry} />
          </View>
          {details}
        </View>
      ) : (
        <>
          <VideoStage player={player} session={session} onRetry={retry} />
          <View style={styles.flex}>{details}</View>
        </>
      )}
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
              title="Title unavailable"
              message={state.error.message}
              actionLabel="Retry"
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
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.black,
  },
  topTitle: { flex: 1, textAlign: 'center' },
  topSpacer: { width: 36 },
  placeholder: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.black },
  split: { flex: 1, flexDirection: 'row', gap: spacing.lg },
  sidePanel: { flex: 1 },
  details: { paddingTop: spacing.lg, gap: spacing.lg },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  titleBlock: { gap: spacing.xs },
});
