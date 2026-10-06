import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { Stream } from '../../../domain/entities/Stream';
import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Badge } from '../atoms/Badge';
import { PressableScale } from '../atoms/PressableScale';

interface LabStreamRowProps {
  stream: Stream;
  supported: boolean;
  onPress: () => void;
}

export function LabStreamRow({ stream, supported, onPress }: LabStreamRowProps) {
  const icon: keyof typeof Ionicons.glyphMap = stream.tags.includes('Error')
    ? 'warning-outline'
    : 'flask-outline';

  return (
    <PressableScale
      onPress={onPress}
      disabled={!supported}
      accessibilityRole="button"
      accessibilityLabel={`Reproducir ${stream.title}`}
      accessibilityState={{ disabled: !supported }}
      style={[styles.row, !supported && styles.disabled]}
    >
      <LinearGradient colors={stream.artwork.colors} style={styles.icon}>
        <Ionicons name={supported ? icon : 'lock-closed-outline'} size={20} color={colors.white} />
      </LinearGradient>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.title}>
            {stream.title}
          </AppText>
          <Badge label={stream.format} tone="primary" />
        </View>
        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {supported ? stream.description : 'No disponible en esta plataforma.'}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.5 },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flexShrink: 1 },
});
