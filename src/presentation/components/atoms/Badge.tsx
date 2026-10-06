import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { LiveDot } from './LiveDot';

type BadgeTone = 'neutral' | 'live' | 'primary' | 'glass' | 'warning';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const backgrounds: Record<BadgeTone, string> = {
  neutral: colors.surfaceRaised,
  live: colors.live,
  primary: colors.primarySoft,
  glass: 'rgba(255,255,255,0.14)',
  warning: 'rgba(251,191,36,0.16)',
};

const textColors: Record<BadgeTone, string> = {
  neutral: colors.textMuted,
  live: colors.white,
  primary: colors.primary,
  glass: colors.white,
  warning: colors.warning,
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: backgrounds[tone] }]}>
      {tone === 'live' && <LiveDot color={colors.white} size={6} />}
      <AppText variant="overline" style={{ color: textColors[tone] }} uppercase>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
});
