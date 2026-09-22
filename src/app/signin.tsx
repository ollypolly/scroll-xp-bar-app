import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { GOOGLE_LOGOUT_URL, GOOGLE_SIGN_IN_URL, WEBVIEW_USER_AGENT } from '../youtube/webviewConfig';

/**
 * A dedicated sign-in (and, with `?mode=logout`, sign-out) screen so the Shorts screen
 * doesn't have to juggle "am I on Shorts or mid-login" state. Google actively detects
 * and can block logins from an embedded WebView even with a spoofed user agent - this
 * is a best-effort workaround, not a guarantee.
 */
export default function SignInScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isLogout = mode === 'logout';
  const setSignedInToYouTube = useProgressStore((state) => state.setSignedInToYouTube);

  function handleDone() {
    // Optimistic - the real, live signal comes from the Shorts WebView the next time
    // it's open (see youtubeInjection.ts). Tapping "Done" after a deliberate logout is
    // a strong enough signal to update the badge immediately instead of waiting for that.
    if (isLogout) setSignedInToYouTube(false);
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isLogout ? 'Log out of YouTube' : 'Sign in to YouTube'}</Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ uri: isLogout ? GOOGLE_LOGOUT_URL : GOOGLE_SIGN_IN_URL }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
  },
  doneText: {
    ...typography.label,
    color: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
});
