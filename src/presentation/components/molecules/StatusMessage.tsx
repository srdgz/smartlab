import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Button } from '../atoms/Button';

interface StatusMessageProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function StatusMessage({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  compact,
}: StatusMessageProps) {
  return (
    <View style={[styles.container, compact && styles.compact]} accessibilityRole="alert">
      <View style={styles.inner}>
        <View style={[styles.icon, compact && styles.iconCompact]}>
          <Ionicons name={icon} size={compact ? 22 : 30} color={colors.text} />
        </View>
        <AppText variant={compact ? 'bodyStrong' : 'headline'} style={styles.center}>
          {title}
        </AppText>
        {message && (
          <AppText variant="caption" tone="muted" style={styles.center} numberOfLines={3}>
            {message}
          </AppText>
        )}
        {actionLabel && onAction && (
          <View style={styles.action}>
            <Button label={actionLabel} icon="refresh" onPress={onAction} compact />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  compact: { padding: spacing.lg },
  inner: { maxWidth: 420, alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    marginBottom: spacing.sm,
  },
  iconCompact: { width: 44, height: 44, borderRadius: 22, marginBottom: spacing.xs },
  center: { textAlign: 'center' },
  action: { marginTop: spacing.md },
});
