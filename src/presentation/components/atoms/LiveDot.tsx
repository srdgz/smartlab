import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/tokens';

interface LiveDotProps {
  color?: string;
  size?: number;
}

export function LiveDot({ color = colors.live, size = 8 }: LiveDotProps) {
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ring = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
  };

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[styles.fill, { backgroundColor: color, borderRadius: size / 2 }, ring]}
      />
      <View style={[styles.fill, { backgroundColor: color, borderRadius: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
});
