import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getContainer, type RuntimeEnvironment } from '../../di/container';
import { AppText } from '../components/atoms/AppText';
import { Button } from '../components/atoms/Button';
import { IconButton } from '../components/atoms/IconButton';
import { ServiceRow } from '../components/molecules/ServiceRow';
import { colors, radius, spacing } from '../theme/tokens';

const ENVIRONMENT_LABEL: Record<RuntimeEnvironment, string> = {
  'expo-go': 'Expo Go',
  'native-build': 'Build nativa (EAS)',
  web: 'Web',
};

export function DiagnosticsScreen() {
  const insets = useSafeAreaInsets();
  const container = getContainer();
  const { analytics, crashReporter, push, catalogRepository, environment, firebaseEnabled } = container;
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    analytics.screen('diagnostics');
    if (push.isAvailable) void push.getToken().then(setToken);
  }, [analytics, push]);

  const sendTestEvent = () => {
    analytics.track({ name: 'diagnostics_test', params: { source: 'diagnostics_screen' } });
    Alert.alert('Evento enviado', `diagnostics_test → ${analytics.provider}`);
  };

  const recordNonFatal = () => {
    crashReporter.recordError(new Error('Error no fatal de prueba desde Diagnóstico'));
    Alert.alert('Error registrado', `Enviado a ${crashReporter.provider}`);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <AppText variant="title">Diagnóstico</AppText>
        <IconButton icon="close" size={36} accessibilityLabel="Cerrar" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {!firebaseEnabled && (
          <View style={styles.notice}>
            <AppText variant="bodyStrong">Firebase en modo consola</AppText>
            <AppText variant="caption" tone="muted">
              Analytics, Crashlytics y FCM necesitan código nativo, que Expo Go no incluye. Los eventos se
              registran en la consola de Metro; en una build de EAS se envían a Firebase sin cambiar
              ninguna pantalla.
            </AppText>
          </View>
        )}

        <View style={styles.card}>
          <AppText variant="overline" tone="muted" uppercase>
            Servicios
          </AppText>
          <ServiceRow icon="analytics-outline" title="Analítica" detail={analytics.provider} active={firebaseEnabled} />
          <ServiceRow icon="bug-outline" title="Informes de errores" detail={crashReporter.provider} active={firebaseEnabled} />
          <ServiceRow
            icon="notifications-outline"
            title="Notificaciones push"
            detail={push.isAvailable ? push.provider : 'Requiere build nativa'}
            active={push.isAvailable}
          />
          <ServiceRow icon="server-outline" title="Catálogo" detail={catalogRepository.source} active />
        </View>

        <View style={styles.card}>
          <AppText variant="overline" tone="muted" uppercase>
            Entorno
          </AppText>
          <View style={styles.kv}>
            <AppText variant="caption" tone="muted">Ejecución</AppText>
            <AppText variant="caption">{ENVIRONMENT_LABEL[environment]}</AppText>
          </View>
          <View style={styles.kv}>
            <AppText variant="caption" tone="muted">Plataforma</AppText>
            <AppText variant="caption">
              {Platform.OS} {String(Platform.Version)}
            </AppText>
          </View>
        </View>

        {push.isAvailable && (
          <View style={styles.card}>
            <AppText variant="overline" tone="muted" uppercase>
              Token FCM
            </AppText>
            <AppText variant="caption" tone="muted" selectable numberOfLines={3}>
              {token ?? 'Obteniendo token…'}
            </AppText>
            <AppText variant="caption" tone="subtle">
              Envía una notificación de prueba desde Firebase Console con el dato streamId para abrir
              directamente el reproductor.
            </AppText>
            {token && (
              <Button
                label="Copiar token"
                icon="copy-outline"
                variant="secondary"
                compact
                onPress={() => void Clipboard.setStringAsync(token)}
              />
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button label="Enviar evento de prueba" icon="paper-plane-outline" variant="brand" onPress={sendTestEvent} />
          <Button label="Registrar error no fatal" icon="alert-circle-outline" variant="secondary" onPress={recordNonFatal} />
          {crashReporter.canCrash && (
            <Button label="Forzar crash de prueba" icon="nuclear-outline" variant="danger" onPress={() => crashReporter.crash()} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: { padding: spacing.lg, gap: spacing.lg },
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  kv: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { gap: spacing.sm },
});
