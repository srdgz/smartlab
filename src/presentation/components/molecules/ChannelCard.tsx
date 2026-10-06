import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { Stream } from '../../../domain/entities/Stream';
import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Artwork } from '../atoms/Artwork';
import { Badge } from '../atoms/Badge';
import { PressableScale } from '../atoms/PressableScale';

interface ChannelCardProps {
  stream: Stream;
  onPress: () => void;
  width?: number;
}

export function ChannelCard({ stream, onPress, width = 260 }: ChannelCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${stream.title} en directo`}
      style={{ width }}
    >
      <Artwork artwork={stream.artwork} kind="backdrop" style={styles.card}>
        <View style={styles.glow} />
        <View style={styles.content}>
          <View style={styles.top}>
            <Badge label="En directo" tone="live" />
            <Ionicons name="radio-outline" size={22} color="rgba(255,255,255,0.85)" />
          </View>
          <View style={styles.bottom}>
            <AppText variant="headline" numberOfLines={1}>
              {stream.title}
            </AppText>
            <AppText variant="caption" style={styles.caption} numberOfLines={1}>
              {stream.subtitle}
            </AppText>
          </View>
        </View>
      </Artwork>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -50,
    top: -70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  content: { flex: 1, justifyContent: 'space-between', padding: spacing.md + 2 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottom: { gap: spacing.xxs },
  caption: { color: 'rgba(255,255,255,0.75)' },
});
