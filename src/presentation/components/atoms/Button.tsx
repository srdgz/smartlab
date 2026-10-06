import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, gradients, radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'brand' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: ButtonVariant;
  disabled?: boolean;
  compact?: boolean;
}

const foreground: Record<ButtonVariant, string> = {
  primary: colors.black,
  brand: colors.white,
  secondary: colors.text,
  ghost: colors.text,
  danger: colors.danger,
};

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  compact,
}: ButtonProps) {
  const content = (
    <View style={[styles.content, compact && styles.compact]}>
      {icon && <Ionicons name={icon} size={compact ? 16 : 20} color={foreground[variant]} />}
      <AppText variant="bodyStrong" style={{ color: foreground[variant] }}>
        {label}
      </AppText>
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.base, styles[variant], disabled && styles.disabled]}
    >
      {variant === 'brand' ? (
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, overflow: 'hidden' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },
  compact: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2 },
  gradient: { borderRadius: radius.md },
  primary: { backgroundColor: colors.white },
  brand: {},
  secondary: { backgroundColor: 'rgba(255,255,255,0.12)' },
  ghost: { borderWidth: 1, borderColor: colors.borderStrong },
  danger: { backgroundColor: 'rgba(248,113,113,0.12)' },
  disabled: { opacity: 0.4 },
});
