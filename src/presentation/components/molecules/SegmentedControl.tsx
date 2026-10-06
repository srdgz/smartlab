import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

interface SegmentedControlProps<K extends string> {
  segments: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}

export function SegmentedControl<K extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<K>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {segments.map((segment) => {
        const selected = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            onPress={() => onChange(segment.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}
          >
            <AppText variant="caption" tone={selected ? 'default' : 'muted'}>
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  selected: { backgroundColor: colors.surfaceRaised },
});
