import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrapContainer, getContainer } from '../di/container';
import { PushBanner } from '../presentation/components/organisms/PushBanner';
import { usePushNotifications } from '../presentation/hooks/usePushNotifications';
import { colors } from '../presentation/theme/tokens';

void SplashScreen.preventAutoHideAsync();

function AppShell() {
  const { banner, open, dismiss } = usePushNotifications(getContainer().push);

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="player/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="diagnostics" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      {banner && <PushBanner message={banner} onOpen={open} onDismiss={dismiss} />}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [servicesReady, setServicesReady] = useState(false);

  useEffect(() => {
    void bootstrapContainer().finally(() => setServicesReady(true));
  }, []);

  const ready = (fontsLoaded || fontError !== null) && servicesReady;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
