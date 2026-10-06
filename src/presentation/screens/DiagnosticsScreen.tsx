import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { getContainer, type RuntimeEnvironment } from '../../di/container';
import { AppText } from '../components/atoms/AppText';
import { Button } from '../components/atoms/Button';
import { IconButton } from '../components/atoms/IconButton';
import { ServiceRow } from '../components/molecules/ServiceRow';
import { useLayout } from '../hooks/useLayout';
import { colors, radius, spacing } from '../theme/tokens';

const ENVIRONMENT_LABEL: Record<RuntimeEnvironment, string> = {
  'expo-go': 'Expo Go',
  'native-build': 'Native build (EAS)',
  web: 'Web',
};

const MAX_WIDTH = 640;

export function DiagnosticsScreen() {
  const { insets, gutter, width } = useLayout();
  const { analytics, crashReporter, catalogRepository, environment, firebaseEnabled } =
    getContainer();
  const horizontal = Math.max(gutter, (width - MAX_WIDTH) / 2);

  useEffect(() => {
    analytics.screen('diagnostics');
  }, [analytics]);

  const sendTestEvent = () => {
    analytics.track({ name: 'diagnostics_test', params: { source: 'diagnostics_screen' } });
    Alert.alert('Event sent', `diagnostics_test → ${analytics.provider}`);
  };

  const recordNonFatal = () => {
    crashReporter.recordError(new Error('Test non-fatal error from Diagnostics'));
    Alert.alert('Error recorded', `Sent to ${crashReporter.provider}`);
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingLeft: horizontal + insets.left,
            paddingRight: horizontal + insets.right,
          },
        ]}
      >
        <AppText variant="title">Diagnostics</AppText>
        <IconButton
          icon="close"
          size={36}
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: horizontal + insets.left,
            paddingRight: horizontal + insets.right,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        {!firebaseEnabled && (
          <View style={styles.notice}>
            <AppText variant="bodyStrong">Firebase in console mode</AppText>
            <AppText variant="caption" tone="muted">
              Analytics and Crashlytics need native code that Expo Go does not ship. Events are
              logged to the Metro console; in an EAS build they are sent to Firebase without
              changing any screen.
            </AppText>
          </View>
        )}

        <View style={styles.card}>
          <AppText variant="overline" tone="muted" uppercase>
            Services
          </AppText>
          <ServiceRow
            icon="analytics-outline"
            title="Analytics"
            detail={analytics.provider}
            active={firebaseEnabled}
          />
          <ServiceRow
            icon="bug-outline"
            title="Crash reporting"
            detail={crashReporter.provider}
            active={firebaseEnabled}
          />
          <ServiceRow
            icon="server-outline"
            title="Catalog"
            detail={catalogRepository.source}
            active
          />
        </View>

        <View style={styles.card}>
          <AppText variant="overline" tone="muted" uppercase>
            Environment
          </AppText>
          <View style={styles.kv}>
            <AppText variant="caption" tone="muted">
              Runtime
            </AppText>
            <AppText variant="caption">{ENVIRONMENT_LABEL[environment]}</AppText>
          </View>
          <View style={styles.kv}>
            <AppText variant="caption" tone="muted">
              Platform
            </AppText>
            <AppText variant="caption">
              {Platform.OS} {String(Platform.Version)}
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Send test event"
            icon="paper-plane-outline"
            variant="brand"
            onPress={sendTestEvent}
          />
          <Button
            label="Record non-fatal error"
            icon="alert-circle-outline"
            variant="secondary"
            onPress={recordNonFatal}
          />
          {crashReporter.canCrash && (
            <Button
              label="Force test crash"
              icon="nuclear-outline"
              variant="danger"
              onPress={() => crashReporter.crash()}
            />
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
    paddingBottom: spacing.md,
  },
  content: { paddingTop: spacing.lg, gap: spacing.lg },
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
