import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Animated, Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

export function PressableScale({
  style,
  scaleTo = 0.97,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...props
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const animateTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic && Platform.OS !== 'web') void Haptics.selectionAsync();
        onPress?.(event);
      }}
    >
      {(state) => (
        <Animated.View style={[style, { transform: [{ scale }] }]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
