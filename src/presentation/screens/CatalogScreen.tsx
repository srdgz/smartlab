import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Platform, RefreshControl, StyleSheet, View } from 'react-native';

import { getContainer } from '../../di/container';
import { isStreamSupported, type Stream } from '../../domain/entities/Stream';
import { AppText } from '../components/atoms/AppText';
import { channelCardWidth, posterCardWidth } from '../components/molecules/cardSizes';
import { ChannelCard } from '../components/molecules/ChannelCard';
import { LabStreamRow } from '../components/molecules/LabStreamRow';
import { PosterCard } from '../components/molecules/PosterCard';
import { SectionHeader } from '../components/molecules/SectionHeader';
import { StatusMessage } from '../components/molecules/StatusMessage';
import { CatalogHeader } from '../components/organisms/CatalogHeader';
import { CatalogSkeleton } from '../components/organisms/CatalogSkeleton';
import { HeroBanner } from '../components/organisms/HeroBanner';
import { StreamRail } from '../components/organisms/StreamRail';
import { useAsync } from '../hooks/useAsync';
import { useLayout } from '../hooks/useLayout';
import { colors, spacing } from '../theme/tokens';

const HEADER_HEIGHT = 56;

export function CatalogScreen() {
  const layout = useLayout();
  const { insets, insetLeft, insetRight, breakpoint } = layout;
  const { getCatalog, analytics, catalogRepository } = getContainer();
  const load = useCallback(
    ({ refresh }: { refresh: boolean }) => getCatalog.execute({ refresh }),
    [getCatalog],
  );
  const { state, retry, refresh } = useAsync(load);
  const [scrollY] = useState(() => new Animated.Value(0));
  const headerBackground = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    analytics.screen('catalog');
  }, [analytics]);

  const open = (stream: Stream) => {
    analytics.track({
      name: 'open_stream',
      params: { stream_id: stream.id, category: stream.category },
    });
    router.push({ pathname: '/player/[id]', params: { id: stream.id } });
  };

  const header = (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.headerBackground, { opacity: headerBackground }]} />
      <CatalogHeader onOpenDiagnostics={() => router.push('/diagnostics')} />
    </View>
  );

  if (state.status === 'loading') {
    return (
      <View style={styles.screen}>
        <CatalogSkeleton />
        {header}
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + HEADER_HEIGHT }]}>
        <StatusMessage
          icon="cloud-offline-outline"
          title="We couldn't load the catalog"
          message={state.error.message}
          actionLabel="Retry"
          onAction={retry}
        />
        {header}
      </View>
    );
  }

  const { featured, live, vod, lab } = state.data;
  const labColumns = breakpoint === 'compact' ? 1 : 2;
  const channelWidth = channelCardWidth(layout);
  const posterWidth = posterCardWidth(breakpoint);

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={refresh}
            tintColor={colors.text}
            progressViewOffset={insets.top + HEADER_HEIGHT}
          />
        }
      >
        {featured ? (
          <HeroBanner stream={featured} onPlay={() => open(featured)} />
        ) : (
          <View style={{ height: insets.top + HEADER_HEIGHT }} />
        )}

        <StreamRail
          title="Live"
          caption="Linear HLS channels"
          live
          streams={live}
          renderItem={(stream) => (
            <ChannelCard stream={stream} width={channelWidth} onPress={() => open(stream)} />
          )}
        />

        <StreamRail
          title="On demand"
          caption="VOD with ABR, multi-audio and subtitles"
          streams={vod}
          renderItem={(stream) => (
            <PosterCard stream={stream} width={posterWidth} onPress={() => open(stream)} />
          )}
        />

        {lab.length > 0 && (
          <View style={styles.lab}>
            <SectionHeader title="Lab" caption="Technical cases: formats and errors" />
            <View style={[styles.labList, { paddingLeft: insetLeft, paddingRight: insetRight }]}>
              {lab.map((stream) => (
                <View key={stream.id} style={labColumns === 1 ? styles.labFull : styles.labHalf}>
                  <LabStreamRow
                    stream={stream}
                    supported={isStreamSupported(stream, Platform.OS)}
                    onPress={() => open(stream)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <AppText variant="caption" tone="subtle" style={styles.footer}>
          Catalog source: {catalogRepository.source}
        </AppText>
      </Animated.ScrollView>
      {header}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7,8,12,0.94)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: { gap: spacing.xl },
  lab: { gap: spacing.md },
  labList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  labFull: { width: '100%' },
  labHalf: { width: '49.4%' },
  footer: { textAlign: 'center', paddingHorizontal: spacing.lg },
});
