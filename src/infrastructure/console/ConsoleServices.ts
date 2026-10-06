import type { AnalyticsEvent, AnalyticsService } from '../../domain/services/AnalyticsService';
import type { CrashReporter } from '../../domain/services/CrashReporter';
import type { PushMessage, PushService, Unsubscribe } from '../../domain/services/PushService';

export class ConsoleAnalytics implements AnalyticsService {
  readonly provider = 'Consola (modo desarrollo)';

  track(event: AnalyticsEvent): void {
    if (__DEV__) console.log(`[analytics] ${event.name}`, event.params);
  }

  screen(name: string): void {
    if (__DEV__) console.log(`[analytics] screen_view`, { screen_name: name });
  }
}

export class ConsoleCrashReporter implements CrashReporter {
  readonly provider = 'Consola (modo desarrollo)';
  readonly canCrash = false;

  log(message: string): void {
    if (__DEV__) console.log(`[crash] ${message}`);
  }

  setAttribute(key: string, value: string): void {
    if (__DEV__) console.log(`[crash] attribute ${key}=${value}`);
  }

  recordError(error: Error): void {
    if (__DEV__) console.warn(`[crash] non-fatal ${error.name}: ${error.message}`);
  }

  crash(): void {}
}

export class UnavailablePushService implements PushService {
  readonly provider = 'No disponible';
  readonly isAvailable = false;

  async requestPermission(): Promise<boolean> {
    return false;
  }

  async getToken(): Promise<string | null> {
    return null;
  }

  onForegroundMessage(_listener: (message: PushMessage) => void): Unsubscribe {
    return () => {};
  }

  onMessageOpened(_listener: (message: PushMessage) => void): Unsubscribe {
    return () => {};
  }

  async getInitialMessage(): Promise<PushMessage | null> {
    return null;
  }
}
