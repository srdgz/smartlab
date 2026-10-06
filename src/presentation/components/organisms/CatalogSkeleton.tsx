import { StyleSheet, View } from 'react-native';

import { useLayout } from '../../hooks/useLayout';
import { radius, spacing } from '../../theme/tokens';
import { Skeleton } from '../atoms/Skeleton';
import { channelCardWidth, posterCardWidth } from '../molecules/cardSizes';
import { heroHeight } from './HeroBanner';

export function CatalogSkeleton() {
  const layout = useLayout();
  const { width, height, isCompact, insetLeft, breakpoint } = layout;
  const channelWidth = channelCardWidth(layout);
  const posterWidth = posterCardWidth(breakpoint);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Loading catalog"
      accessibilityRole="progressbar"
    >
      <Skeleton height={heroHeight(width, height, isCompact)} radius={0} />
      <View style={[styles.section, { paddingLeft: insetLeft }]}>
        <Skeleton width={140} height={20} />
        <View style={styles.row}>
          {[0, 1, 2].map((key) => (
            <Skeleton
              key={key}
              width={channelWidth}
              height={(channelWidth * 9) / 16}
              radius={radius.lg}
            />
          ))}
        </View>
      </View>
      <View style={[styles.section, { paddingLeft: insetLeft }]}>
        <Skeleton width={160} height={20} />
        <View style={styles.row}>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} width={posterWidth} height={posterWidth * 1.5} radius={radius.lg} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl, overflow: 'hidden' },
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
});
