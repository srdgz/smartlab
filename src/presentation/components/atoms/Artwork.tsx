import { Image, type ImageContentPosition } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { StreamArtwork } from '../../../domain/entities/Stream';
import { resolveArtwork } from '../../assets/artwork';

interface ArtworkProps {
  artwork: StreamArtwork;
  kind?: 'poster' | 'backdrop';
  position?: ImageContentPosition;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function Artwork({ artwork, kind = 'poster', position = 'center', style, children }: ArtworkProps) {
  const key = kind === 'backdrop' ? (artwork.backdrop ?? artwork.poster) : artwork.poster;
  const source = resolveArtwork(key);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={artwork.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {source !== undefined && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={position}
          transition={250}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});
