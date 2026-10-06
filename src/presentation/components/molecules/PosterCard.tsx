import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { Stream } from '../../../domain/entities/Stream';
import { colors, gradients, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Artwork } from '../atoms/Artwork';
import { PressableScale } from '../atoms/PressableScale';

interface PosterCardProps {
  stream: Stream;
  onPress: () => void;
  width?: number;
}

export function PosterCard({ stream, onPress, width = 140 }: PosterCardProps) {
  const hasImage = Boolean(stream.artwork.poster);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Reproducir ${stream.title}`}
      style={[styles.container, { width }]}
    >
      <Artwork artwork={stream.artwork} style={styles.poster}>
        {!hasImage && (
          <View style={styles.typographic}>
            <AppText variant="overline" style={styles.typoOverline} uppercase>
              {stream.format}
            </AppText>
            <AppText variant="title" numberOfLines={3}>
              {stream.title}
            </AppText>
          </View>
        )}
        <LinearGradient colors={gradients.scrimCard} style={styles.scrim} />
      </Artwork>
      <View style={styles.meta}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {stream.title}
        </AppText>
        <AppText variant="caption" tone="subtle" numberOfLines={1}>
          {stream.subtitle}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  poster: {
    aspectRatio: 2 / 3,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  typographic: { flex: 1, justifyContent: 'flex-end', padding: spacing.md, zIndex: 1, gap: spacing.xs },
  typoOverline: { color: 'rgba(255,255,255,0.7)' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%' },
  meta: { gap: spacing.xxs },
});
