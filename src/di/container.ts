import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { LocalCatalogDataSource } from '../data/datasources/LocalCatalogDataSource';
import { RemoteCatalogDataSource } from '../data/datasources/RemoteCatalogDataSource';
import { CatalogRepositoryImpl } from '../data/repositories/CatalogRepositoryImpl';
import type { CatalogRepository } from '../domain/repositories/CatalogRepository';
import type { AnalyticsService } from '../domain/services/AnalyticsService';
import type { CrashReporter } from '../domain/services/CrashReporter';
import type { PushService } from '../domain/services/PushService';
import { GetCatalog } from '../domain/usecases/GetCatalog';
import { GetStream } from '../domain/usecases/GetStream';
import { ReportPlaybackEvent } from '../domain/usecases/ReportPlaybackEvent';
import {
  ConsoleAnalytics,
  ConsoleCrashReporter,
  UnavailablePushService,
} from '../infrastructure/console/ConsoleServices';

export type RuntimeEnvironment = 'expo-go' | 'native-build' | 'web';

export interface Container {
  environment: RuntimeEnvironment;
  firebaseEnabled: boolean;
  catalogRepository: CatalogRepository;
  analytics: AnalyticsService;
  crashReporter: CrashReporter;
  push: PushService;
  getCatalog: GetCatalog;
  getStream: GetStream;
  reportPlaybackEvent: ReportPlaybackEvent;
}

function detectEnvironment(): RuntimeEnvironment {
  if (Platform.OS === 'web') return 'web';
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient ? 'expo-go' : 'native-build';
}

function compose(
  environment: RuntimeEnvironment,
  services: Pick<Container, 'analytics' | 'crashReporter' | 'push'>,
  firebaseEnabled: boolean,
): Container {
  const catalogUrl = process.env.EXPO_PUBLIC_CATALOG_URL;
  const catalogRepository = new CatalogRepositoryImpl(
    catalogUrl ? new RemoteCatalogDataSource(catalogUrl) : new LocalCatalogDataSource(),
  );

  return {
    environment,
    firebaseEnabled,
    catalogRepository,
    ...services,
    getCatalog: new GetCatalog(catalogRepository),
    getStream: new GetStream(catalogRepository),
    reportPlaybackEvent: new ReportPlaybackEvent(services.analytics, services.crashReporter),
  };
}

const environment = detectEnvironment();

let container: Container = compose(
  environment,
  {
    analytics: new ConsoleAnalytics(),
    crashReporter: new ConsoleCrashReporter(),
    push: new UnavailablePushService(),
  },
  false,
);

export async function bootstrapContainer(): Promise<Container> {
  if (environment !== 'native-build') return container;
  try {
    const { createFirebaseServices } = await import('../infrastructure/firebase/FirebaseServices');
    container = compose(environment, createFirebaseServices(), true);
  } catch (error) {
    container.crashReporter.log(`Firebase no disponible: ${String(error)}`);
  }
  return container;
}

export function getContainer(): Container {
  return container;
}
