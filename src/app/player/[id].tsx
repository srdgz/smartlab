import { useLocalSearchParams } from 'expo-router';

import { PlayerScreen } from '../../presentation/screens/PlayerScreen';

export default function PlayerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlayerScreen key={id} id={id} />;
}
