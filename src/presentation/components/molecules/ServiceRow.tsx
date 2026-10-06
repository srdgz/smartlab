import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

interface ServiceRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  active: boolean;
}

export function ServiceRow({ icon, title, detail, active }: ServiceRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>
      <View style={styles.body}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {detail}
        </AppText>
      </View>
      <View style={[styles.status, { backgroundColor: active ? colors.success : colors.textSubtle }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xxs },
  status: { width: 10, height: 10, borderRadius: 5 },
});
