import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { Stream } from '../../../domain/entities/Stream';
import { gradients, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Artwork } from '../atoms/Artwork';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface HeroBannerProps {
  stream: Stream;
  onPlay: () => void;
}

export function HeroBanner({ stream, onPlay }: HeroBannerProps) {
  return (
    <Artwork artwork={stream.artwork} kind="backdrop" position="center" style={styles.hero}>
      <LinearGradient colors={gradients.scrimTop} locations={[0, 0.25]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradients.scrimBottom} locations={[0.3, 0.65, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <Badge label="Destacado" tone="glass" />
        <AppText variant="display" numberOfLines={2}>
          {stream.title}
        </AppText>
        <AppText variant="caption" tone="muted">
          {stream.subtitle}
        </AppText>
        <AppText variant="body" tone="muted" numberOfLines={2} style={styles.description}>
          {stream.description}
        </AppText>
        <View style={styles.tags}>
          {stream.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
        <View style={styles.actions}>
          <Button label="Reproducir" icon="play" onPress={onPlay} />
        </View>
      </View>
    </Artwork>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', aspectRatio: 0.78 },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  description: { maxWidth: 520 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.sm },
});
