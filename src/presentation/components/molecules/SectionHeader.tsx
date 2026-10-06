import { StyleSheet, View } from 'react-native';

import { useLayout } from '../../hooks/useLayout';
import { spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { LiveDot } from '../atoms/LiveDot';

interface SectionHeaderProps {
  title: string;
  caption?: string;
  live?: boolean;
}

export function SectionHeader({ title, caption, live }: SectionHeaderProps) {
  const { insetLeft, insetRight } = useLayout();

  return (
    <View style={[styles.container, { paddingLeft: insetLeft, paddingRight: insetRight }]}>
      <View style={styles.titleRow}>
        {live && <LiveDot />}
        <AppText variant="headline" accessibilityRole="header">
          {title}
        </AppText>
      </View>
      {caption && (
        <AppText variant="caption" tone="subtle">
          {caption}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
