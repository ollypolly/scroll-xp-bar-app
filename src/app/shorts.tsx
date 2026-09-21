import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, LayoutChangeEvent, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { useEffectSounds } from '../audio/useEffectSounds';
import { XPBar } from '../components/XPBar';
import { LevelUpCelebration } from '../components/effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from '../components/effects/XPOrbBurst';
import { levelUpHaptic, xpGainHaptic } from '../haptics';
import { useProgressStore } from '../store/progressStore';
import { useYouTubeShortsBridge } from '../youtube/useYouTubeShortsBridge';
import { YOUTUBE_INJECTED_JAVASCRIPT } from '../youtube/youtubeInjection';
import { DEFAULT_XP_CONFIG } from '../xp/xpConfig';

const SHORTS_URL = 'https://www.youtube.com/shorts';
const GOOGLE_SIGN_IN_URL = `https://accounts.google.com/ServiceLogin?service=youtube&continue=${encodeURIComponent(SHORTS_URL)}`;

// A plain mobile Safari/Chrome UA (no embedded-webview signature) so Google's sign-in
// page doesn't reject the request as an untrusted embedded browser.
const WEBVIEW_USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
  default: undefined,
});

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SPAWN_POINT: Point = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 140 };

export default function ShortsScreen() {
  const webViewRef = useRef<WebView>(null);
  const { handleWebViewMessage } = useYouTubeShortsBridge(DEFAULT_XP_CONFIG);
  const { playXPGain, playLevelUp } = useEffectSounds();
  const insets = useSafeAreaInsets();

  const [webViewUrl, setWebViewUrl] = useState(SHORTS_URL);
  const [onShortsPage, setOnShortsPage] = useState(true);
  const [xpBarTarget, setXpBarTarget] = useState<Point | null>(null);

  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);
  const clearLastLevelUp = useProgressStore((state) => state.clearLastLevelUp);

  // Fire the pickup sound as soon as XP is awarded (the orb animation plays out
  // independently); clear the award shortly after so the store doesn't hold a stale value.
  useEffect(() => {
    if (lastAward == null) return;
    void playXPGain();
    const timeout = setTimeout(clearLastAward, 600);
    return () => clearTimeout(timeout);
  }, [lastAward, playXPGain, clearLastAward]);

  useEffect(() => {
    if (lastLevelUp == null) return;
    levelUpHaptic();
    void playLevelUp();
  }, [lastLevelUp, playLevelUp]);

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setXpBarTarget({ x: x + width / 2, y: y + height / 2 });
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setOnShortsPage(navState.url.includes('youtube.com/shorts'));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        userAgent={WEBVIEW_USER_AGENT}
        injectedJavaScript={YOUTUBE_INJECTED_JAVASCRIPT}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        style={styles.webview}
      />

      <View pointerEvents="box-none" style={styles.overlayLayer}>
        <View
          pointerEvents="box-none"
          style={[styles.header, { top: insets.top + 12 }]}
          onLayout={handleHeaderLayout}
        >
          <View style={styles.xpBarWrapper}>
            <XPBar />
          </View>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => setWebViewUrl(GOOGLE_SIGN_IN_URL)}
            accessibilityLabel="Sign in to YouTube"
          >
            <Text style={styles.accountButtonText}>{'\u{1F464}'}</Text>
          </TouchableOpacity>
        </View>

        {!onShortsPage && (
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 64 }]}
            onPress={() => setWebViewUrl(SHORTS_URL)}
          >
            <Text style={styles.backButtonText}>Back to Shorts</Text>
          </TouchableOpacity>
        )}

        <XPOrbBurst
          award={lastAward}
          spawnPoint={ORB_SPAWN_POINT}
          targetPoint={xpBarTarget}
          onOrbLanded={xpGainHaptic}
        />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBarWrapper: {
    flex: 1,
  },
  accountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,15,20,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButtonText: {
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(15,15,20,0.75)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
