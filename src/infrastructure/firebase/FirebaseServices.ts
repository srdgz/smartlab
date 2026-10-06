import { getApp } from '@react-native-firebase/app';
import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import {
  crash,
  getCrashlytics,
  log,
  recordError,
  setAttribute,
} from '@react-native-firebase/crashlytics';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import type { AnalyticsEvent, AnalyticsService } from '../../domain/services/AnalyticsService';
import type { CrashReporter } from '../../domain/services/CrashReporter';
import type { PushMessage, PushService, Unsubscribe } from '../../domain/services/PushService';

type RemoteMessage = Parameters<Parameters<typeof onMessage>[1]>[0];

function toPushMessage(message: RemoteMessage): PushMessage {
  const streamId = message.data?.streamId;
  return {
    title: message.notification?.title,
    body: message.notification?.body,
    streamId: typeof streamId === 'string' ? streamId : undefined,
  };
}

export class FirebaseAnalytics implements AnalyticsService {
  readonly provider = 'Firebase Analytics';
  private readonly analytics = getAnalytics(getApp());

  track(event: AnalyticsEvent): void {
    void logEvent(this.analytics, event.name, event.params);
  }

  screen(name: string): void {
    void logScreenView(this.analytics, { screen_name: name, screen_class: name });
  }
}

export class FirebaseCrashReporter implements CrashReporter {
  readonly provider = 'Firebase Crashlytics';
  readonly canCrash = true;
  private readonly crashlytics = getCrashlytics(getApp());

  log(message: string): void {
    log(this.crashlytics, message);
  }

  setAttribute(key: string, value: string): void {
    void setAttribute(this.crashlytics, key, value);
  }

  recordError(error: Error): void {
    recordError(this.crashlytics, error, error.name);
  }

  crash(): void {
    crash(this.crashlytics);
  }
}

export class FirebasePushService implements PushService {
  readonly provider = 'Firebase Cloud Messaging';
  readonly isAvailable = true;
  private readonly messaging = getMessaging(getApp());

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Number(Platform.Version) < 33) return true;
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    const status = await requestPermission(this.messaging);
    return (
      status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL
    );
  }

  async getToken(): Promise<string | null> {
    try {
      return await getToken(this.messaging);
    } catch {
      return null;
    }
  }

  onForegroundMessage(listener: (message: PushMessage) => void): Unsubscribe {
    return onMessage(this.messaging, (message) => listener(toPushMessage(message)));
  }

  onMessageOpened(listener: (message: PushMessage) => void): Unsubscribe {
    return onNotificationOpenedApp(this.messaging, (message) => listener(toPushMessage(message)));
  }

  async getInitialMessage(): Promise<PushMessage | null> {
    const message = await getInitialNotification(this.messaging);
    return message ? toPushMessage(message) : null;
  }
}

export function createFirebaseServices() {
  getApp();
  return {
    analytics: new FirebaseAnalytics(),
    crashReporter: new FirebaseCrashReporter(),
    push: new FirebasePushService(),
  };
}
