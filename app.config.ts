import { existsSync } from 'node:fs';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const androidServicesFile = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';
const iosServicesFile = process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist';
const hasAndroidFirebase = existsSync(androidServicesFile);
const hasIosFirebase = existsSync(iosServicesFile);
const firebaseEnabled = hasAndroidFirebase || hasIosFirebase;

const firebasePlugins: ExpoConfig['plugins'] = firebaseEnabled
  ? [
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
      ['@react-native-firebase/analytics', { ios: { withoutAdIdSupport: true } }],
      ['expo-build-properties', { ios: { useFrameworks: 'dynamic' } }],
    ]
  : [];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StreamLab',
  slug: 'streamlab',
  version: '1.0.0',
  scheme: 'streamlab',
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#07080C',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'dev.srdgz.streamlab',
    ...(hasIosFirebase && { googleServicesFile: iosServicesFile }),
  },
  android: {
    package: 'dev.srdgz.streamlab',
    adaptiveIcon: {
      backgroundColor: '#07080C',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    ...(hasAndroidFirebase && { googleServicesFile: androidServicesFile }),
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    ['expo-video', { supportsBackgroundPlayback: true, supportsPictureInPicture: true }],
    'expo-router',
    'expo-image',
    'expo-font',
    [
      'expo-splash-screen',
      { backgroundColor: '#07080C', image: './assets/splash-icon.png', imageWidth: 160 },
    ],
    ...firebasePlugins,
  ],
  extra: {
    firebaseEnabled,
  },
});
