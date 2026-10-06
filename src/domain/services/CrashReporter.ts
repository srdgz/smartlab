export interface CrashReporter {
  readonly provider: string;
  readonly canCrash: boolean;
  log(message: string): void;
  setAttribute(key: string, value: string): void;
  recordError(error: Error): void;
  crash(): void;
}
