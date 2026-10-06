import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

interface MetricTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  columns?: number;
}

export function MetricTile({
  icon,
  label,
  value,
  hint,
  accent = colors.primary,
  columns = 2,
}: MetricTileProps) {
  return (
    <View
      style={[styles.tile, { flexBasis: `${Math.floor(100 / columns) - 4}%` }]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={[styles.icon, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <AppText variant="metric" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="caption" tone="subtle" numberOfLines={1}>
        {hint ? `${label} · ${hint}` : label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
