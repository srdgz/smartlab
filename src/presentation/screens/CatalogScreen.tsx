import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getContainer } from '../../di/container';
import { isStreamSupported, type Stream } from '../../domain/entities/Stream';
import { AppText } from '../components/atoms/AppText';
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
import { colors, spacing } from '../theme/tokens';

export function CatalogScreen() {
  const insets = useSafeAreaInsets();
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
    analytics.track({ name: 'open_stream', params: { stream_id: stream.id, category: stream.category } });
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
      <View style={[styles.screen, { paddingTop: insets.top + 56 }]}>
        <StatusMessage
          icon="cloud-offline-outline"
          title="No hemos podido cargar el catálogo"
          message={state.error.message}
          actionLabel="Reintentar"
          onAction={retry}
        />
        {header}
      </View>
    );
  }

  const { featured, live, vod, lab } = state.data;

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
            progressViewOffset={insets.top + 48}
          />
        }
      >
        {featured ? <HeroBanner stream={featured} onPlay={() => open(featured)} /> : <View style={{ height: insets.top + 64 }} />}

        <StreamRail
          title="En directo"
          caption="Canales lineales HLS"
          live
          streams={live}
          renderItem={(stream) => <ChannelCard stream={stream} onPress={() => open(stream)} />}
        />

        <StreamRail
          title="Bajo demanda"
          caption="VOD con ABR, multi-audio y subtítulos"
          streams={vod}
          renderItem={(stream) => <PosterCard stream={stream} onPress={() => open(stream)} />}
        />

        {lab.length > 0 && (
          <View style={styles.lab}>
            <SectionHeader title="Laboratorio" caption="Casos técnicos: formatos y errores" />
            <View style={styles.labList}>
              {lab.map((stream) => (
                <LabStreamRow
                  key={stream.id}
                  stream={stream}
                  supported={isStreamSupported(stream, Platform.OS)}
                  onPress={() => open(stream)}
                />
              ))}
            </View>
          </View>
        )}

        <AppText variant="caption" tone="subtle" style={styles.footer}>
          Catálogo: {catalogRepository.source}
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
  labList: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  footer: { textAlign: 'center', paddingHorizontal: spacing.lg },
});
