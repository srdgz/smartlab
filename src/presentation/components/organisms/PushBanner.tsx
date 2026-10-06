import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PushMessage } from '../../../domain/services/PushService';
import { colors, radius, spacing } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { IconButton } from '../atoms/IconButton';
import { PressableScale } from '../atoms/PressableScale';

interface PushBannerProps {
  message: PushMessage;
  onOpen: () => void;
  onDismiss: () => void;
}

export function PushBanner({ message, onOpen, onDismiss }: PushBannerProps) {
  const insets = useSafeAreaInsets();
  const [translate] = useState(() => new Animated.Value(-160));

  useEffect(() => {
    Animated.spring(translate, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [translate, onDismiss]);

  return (
    <Animated.View
      style={[styles.wrapper, { top: insets.top + spacing.sm, transform: [{ translateY: translate }] }]}
    >
      <PressableScale onPress={onOpen} accessibilityRole="button" style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="notifications" size={18} color={colors.white} />
        </View>
        <View style={styles.body}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {message.title ?? 'Nueva notificación'}
          </AppText>
          {message.body && (
            <AppText variant="caption" tone="muted" numberOfLines={2}>
              {message.body}
            </AppText>
          )}
        </View>
        <IconButton icon="close" size={32} accessibilityLabel="Cerrar notificación" onPress={onDismiss} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: spacing.md, right: spacing.md, zIndex: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    shadowColor: colors.black,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xxs },
});
