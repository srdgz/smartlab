import { VideoView, type VideoPlayer } from 'expo-video';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { PlaybackSession } from '../../../domain/entities/PlaybackSession';
import { colors } from '../../theme/tokens';
import { StatusMessage } from '../molecules/StatusMessage';

interface VideoStageProps {
  player: VideoPlayer;
  session: PlaybackSession;
  onRetry: () => void;
}

export function VideoStage({ player, session, onRetry }: VideoStageProps) {
  const showSpinner = session.phase === 'loading' || session.phase === 'buffering';

  return (
    <View style={styles.frame}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        contentFit="contain"
        allowsPictureInPicture
        fullscreenOptions={{ enable: true }}
      />
      {showSpinner && (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator color={colors.white} size="large" />
        </View>
      )}
      {session.phase === 'error' && (
        <View style={styles.overlay}>
          <StatusMessage
            compact
            icon="cloud-offline-outline"
            title="This stream could not be played"
            message={session.errorMessage ?? undefined}
            actionLabel="Retry"
            onAction={onRetry}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.black, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7,8,12,0.92)' },
});
