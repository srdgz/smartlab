import type { AnalyticsEvent, AnalyticsService } from '../../domain/services/AnalyticsService';
import type { CrashReporter } from '../../domain/services/CrashReporter';

export class ConsoleAnalytics implements AnalyticsService {
  readonly provider = 'Console (development)';

  track(event: AnalyticsEvent): void {
    if (__DEV__) console.log(`[analytics] ${event.name}`, event.params);
  }

  screen(name: string): void {
    if (__DEV__) console.log(`[analytics] screen_view`, { screen_name: name });
  }
}

export class ConsoleCrashReporter implements CrashReporter {
  readonly provider = 'Console (development)';
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
