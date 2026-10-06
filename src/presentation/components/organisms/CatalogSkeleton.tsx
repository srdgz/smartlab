import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '../../theme/tokens';
import { Skeleton } from '../atoms/Skeleton';

export function CatalogSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Cargando catálogo" accessibilityRole="progressbar">
      <Skeleton height={420} radius={0} />
      <View style={styles.section}>
        <Skeleton width={140} height={20} />
        <View style={styles.row}>
          <Skeleton width={260} height={146} radius={radius.lg} />
          <Skeleton width={260} height={146} radius={radius.lg} />
        </View>
      </View>
      <View style={styles.section}>
        <Skeleton width={160} height={20} />
        <View style={styles.row}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} width={140} height={210} radius={radius.lg} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl, overflow: 'hidden' },
  section: { gap: spacing.md, paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
});
