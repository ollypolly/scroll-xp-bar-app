import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { colors, radii, spacing, typography } from '../theme/tokens';
import { GOOGLE_SIGN_IN_URL, WEBVIEW_USER_AGENT } from '../youtube/webviewConfig';

/**
 * A dedicated sign-in screen so the Shorts screen doesn't have to juggle "am I on
 * Shorts or mid-login" state. Google actively detects and can block logins from an
 * embedded WebView even with a spoofed user agent - this is a best-effort workaround,
 * not a guarantee.
 */
export default function SignInScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ uri: GOOGLE_SIGN_IN_URL }}
        userAgent={WEBVIEW_USER_AGENT}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  doneText: {
    ...typography.label,
    color: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
});
