export interface PushMessage {
  title?: string;
  body?: string;
  streamId?: string;
}

export type Unsubscribe = () => void;

export interface PushService {
  readonly provider: string;
  readonly isAvailable: boolean;
  requestPermission(): Promise<boolean>;
  getToken(): Promise<string | null>;
  onForegroundMessage(listener: (message: PushMessage) => void): Unsubscribe;
  onMessageOpened(listener: (message: PushMessage) => void): Unsubscribe;
  getInitialMessage(): Promise<PushMessage | null>;
}
