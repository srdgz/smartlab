import type { ImageSource } from 'expo-image';

const bundled: Record<string, number> = {
  'tos-poster': require('../../../assets/posters/tos-poster.png'),
  'tos-backdrop': require('../../../assets/posters/tos-backdrop.jpg'),
  'bbb-poster': require('../../../assets/posters/bbb-poster.jpg'),
  'bbb-backdrop': require('../../../assets/posters/bbb-backdrop.jpg'),
};

export function resolveArtwork(key: string | undefined): ImageSource | number | undefined {
  if (!key) return undefined;
  if (key.startsWith('http')) return { uri: key };
  return bundled[key];
}
