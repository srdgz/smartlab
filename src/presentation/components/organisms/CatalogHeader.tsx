import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useLayout } from '../../hooks/useLayout';
import { colors, gradients, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { IconButton } from '../atoms/IconButton';

interface CatalogHeaderProps {
  onOpenDiagnostics: () => void;
}

export function CatalogHeader({ onOpenDiagnostics }: CatalogHeaderProps) {
  const { insetLeft, insetRight } = useLayout();

  return (
    <View style={[styles.container, { paddingLeft: insetLeft, paddingRight: insetRight }]}>
      <View style={styles.brand}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Ionicons name="play" size={16} color={colors.white} />
        </LinearGradient>
        <AppText variant="headline" accessibilityRole="header">
          Stream
          <AppText variant="headline" tone="primary">
            Lab
          </AppText>
        </AppText>
      </View>
      <IconButton icon="pulse" accessibilityLabel="Open diagnostics" onPress={onOpenDiagnostics} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
