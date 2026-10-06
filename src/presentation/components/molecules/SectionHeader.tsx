import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { LiveDot } from '../atoms/LiveDot';

interface SectionHeaderProps {
  title: string;
  caption?: string;
  live?: boolean;
}

export function SectionHeader({ title, caption, live }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
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
  container: { paddingHorizontal: spacing.lg, gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
