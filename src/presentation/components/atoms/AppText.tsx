import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '../../theme/tokens';

type Tone = 'default' | 'muted' | 'subtle' | 'primary' | 'live' | 'danger' | 'success';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
  uppercase?: boolean;
}

const toneColor: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  subtle: colors.textSubtle,
  primary: colors.primary,
  live: colors.live,
  danger: colors.danger,
  success: colors.success,
};

export function AppText({
  variant = 'body',
  tone = 'default',
  uppercase,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        typography[variant],
        { color: toneColor[tone] },
        uppercase && styles.uppercase,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  uppercase: { textTransform: 'uppercase' },
});
