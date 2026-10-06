import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { Chip } from '../atoms/Chip';

export interface Option<T> {
  key: string;
  label: string;
  value: T;
}

interface OptionGroupProps<T> {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: Option<T>[];
  selectedKey: string | null;
  onSelect: (option: Option<T>) => void;
  emptyLabel?: string;
}

export function OptionGroup<T>({
  title,
  icon,
  options,
  selectedKey,
  onSelect,
  emptyLabel,
}: OptionGroupProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <AppText variant="overline" tone="muted" uppercase>
          {title}
        </AppText>
      </View>
      {options.length === 0 ? (
        <AppText variant="caption" tone="subtle">
          {emptyLabel}
        </AppText>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {options.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={option.key === selectedKey}
              onPress={() => onSelect(option)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { gap: spacing.sm },
});
