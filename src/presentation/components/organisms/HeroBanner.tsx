import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { Stream } from '../../../domain/entities/Stream';
import { useLayout } from '../../hooks/useLayout';
import { gradients, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Artwork } from '../atoms/Artwork';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface HeroBannerProps {
  stream: Stream;
  onPlay: () => void;
}

export function heroHeight(width: number, height: number, isCompact: boolean): number {
  if (isCompact) return Math.min(width / 0.78, height * 0.72);
  const short = height < 520;
  return Math.min(Math.max(height * (short ? 0.92 : 0.7), 300), 620);
}

export function HeroBanner({ stream, onPlay }: HeroBannerProps) {
  const { width, height, isCompact, insetLeft, insetRight } = useLayout();
  const short = height < 520;

  return (
    <Artwork
      artwork={stream.artwork}
      kind="backdrop"
      position="center"
      style={{ width: '100%', height: heroHeight(width, height, isCompact) }}
    >
      <LinearGradient
        colors={gradients.scrimTop}
        locations={[0, 0.25]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={gradients.scrimBottom}
        locations={[0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      {!isCompact && (
        <LinearGradient
          colors={gradients.scrimSide}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[styles.content, { paddingLeft: insetLeft, paddingRight: insetRight }]}>
        <View style={styles.copy}>
          <Badge label="Featured" tone="glass" />
          <AppText variant="display" numberOfLines={2}>
            {stream.title}
          </AppText>
          <AppText variant="caption" tone="muted">
            {stream.subtitle}
          </AppText>
          {!short && (
            <>
              <AppText variant="body" tone="muted" numberOfLines={isCompact ? 2 : 3}>
                {stream.description}
              </AppText>
              <View style={styles.tags}>
                {stream.tags.map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </View>
            </>
          )}
          <View style={styles.actions}>
            <Button label="Play" icon="play" onPress={onPlay} />
          </View>
        </View>
      </View>
    </Artwork>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.lg },
  copy: { gap: spacing.sm, maxWidth: 560 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.sm },
});
