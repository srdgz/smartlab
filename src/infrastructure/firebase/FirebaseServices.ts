import { getApp } from '@react-native-firebase/app';
import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import {
  crash,
  getCrashlytics,
  log,
  recordError,
  setAttribute,
} from '@react-native-firebase/crashlytics';

import type { AnalyticsEvent, AnalyticsService } from '../../domain/services/AnalyticsService';
import type { CrashReporter } from '../../domain/services/CrashReporter';

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

export function createFirebaseServices() {
  getApp();
  return {
    analytics: new FirebaseAnalytics(),
    crashReporter: new FirebaseCrashReporter(),
  };
}
