import { FlatList, StyleSheet, View } from 'react-native';

import type { Stream } from '../../../domain/entities/Stream';
import { spacing } from '../../theme/tokens';
import { SectionHeader } from '../molecules/SectionHeader';

interface StreamRailProps {
  title: string;
  caption?: string;
  live?: boolean;
  streams: Stream[];
  renderItem: (stream: Stream) => React.ReactElement;
}

export function StreamRail({ title, caption, live, streams, renderItem }: StreamRailProps) {
  if (streams.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title={title} caption={caption} live={live} />
      <FlatList
        horizontal
        data={streams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
});
