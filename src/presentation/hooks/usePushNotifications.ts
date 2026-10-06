import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import type { PushMessage, PushService } from '../../domain/services/PushService';

function openStream(message: PushMessage) {
  if (message.streamId) {
    router.push({ pathname: '/player/[id]', params: { id: message.streamId } });
  }
}

export function usePushNotifications(push: PushService) {
  const [banner, setBanner] = useState<PushMessage | null>(null);

  useEffect(() => {
    if (!push.isAvailable) return;

    void push.requestPermission();
    void push.getInitialMessage().then((message) => message && openStream(message));

    const unsubscribeForeground = push.onForegroundMessage(setBanner);
    const unsubscribeOpened = push.onMessageOpened(openStream);
    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [push]);

  return {
    banner,
    dismiss: () => setBanner(null),
    open: () => {
      if (banner) openStream(banner);
      setBanner(null);
    },
  };
}
