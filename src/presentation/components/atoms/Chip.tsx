import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected && styles.selected]}
    >
      <AppText variant="caption" style={{ color: selected ? colors.black : colors.text }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  selected: { backgroundColor: colors.white, borderColor: colors.white },
});
