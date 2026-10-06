import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { colors, radius } from '../../theme/tokens';
import { PressableScale } from './PressableScale';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
}

export function IconButton({ icon, onPress, accessibilityLabel, size = 40 }: IconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      scaleTo={0.9}
      style={[styles.button, { width: size, height: size, borderRadius: radius.pill }]}
    >
      <Ionicons name={icon} size={size * 0.5} color={colors.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
});
