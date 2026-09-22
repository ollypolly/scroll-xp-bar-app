import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { useEffectSounds } from '../audio/useEffectSounds';
import { ISLAND_HEIGHT, IslandXPBar } from '../components/IslandXPBar';
import { LevelUpCelebration } from '../components/effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from '../components/effects/XPOrbBurst';
import { levelUpHaptic } from '../haptics';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';
import { useYouTubeShortsBridge } from '../youtube/useYouTubeShortsBridge';
import { YOUTUBE_INJECTED_JAVASCRIPT } from '../youtube/youtubeInjection';
import { SHORTS_URL, WEBVIEW_USER_AGENT } from '../youtube/webviewConfig';
import { DEFAULT_XP_CONFIG } from '../xp/xpConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SPAWN_POINT: Point = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 140 };

/**
 * A normal Stack screen again - the home icon and "Start scrolling" never pop it, only
 * push over it (see `goHome` below and the home screen's button), so it just stays
 * mounted underneath rather than being destroyed. "Start scrolling" then uses
 * `router.dismissTo('/shorts')`, which drops back down to this same still-alive
 * instance if one exists in history, or pushes a fresh one on the very first visit -
 * so leaving and returning resumes exactly where you left off instead of reloading
 * YouTube from scratch.
 */
export default function ShortsScreen() {
  const pathname = usePathname();
  const isActive = pathname === '/shorts';

  const webViewRef = useRef<WebView>(null);
  const { handleWebViewMessage } = useYouTubeShortsBridge(DEFAULT_XP_CONFIG);
  const { playXPGain, playLevelUp } = useEffectSounds();
  const insets = useSafeAreaInsets();

  const [onShortsPage, setOnShortsPage] = useState(true);

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

  // This screen stays mounted (just covered) once something's pushed on top of it, so
  // stop playback the moment that happens - otherwise a video (and its audio) keeps
  // running behind the home screen.
  useEffect(() => {
    if (!isActive) {
      webViewRef.current?.injectJavaScript(
        "try { document.querySelectorAll('video').forEach(function(v){ v.pause(); }); } catch (e) {} true;",
      );
    }
  }, [isActive]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setOnShortsPage(navState.url.includes('youtube.com/shorts'));
  }, []);

  const orbTarget: Point = { x: SCREEN_WIDTH / 2, y: insets.top + spacing.md + ISLAND_HEIGHT / 2 };

  // Always pushes a fresh home screen rather than popping back to an existing one, so
  // this screen is never popped (and never unmounted) - the home screen's "Start
  // scrolling" then uses dismissTo to drop straight back down to this same instance.
  function goHome() {
    router.push('/');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WebView
        ref={webViewRef}
        source={{ uri: SHORTS_URL }}
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
        <View pointerEvents="box-none" style={[styles.header, { top: insets.top + spacing.md }]}>
          {!onShortsPage && (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => webViewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(SHORTS_URL)}; true;`)}
            >
              <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <Ionicons name="home" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <IslandXPBar />
        </View>

        <XPOrbBurst award={lastAward} spawnPoint={ORB_SPAWN_POINT} targetPoint={orbTarget} />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />
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
  overlayLayer: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  homeButton: {
    width: ISLAND_HEIGHT,
    height: ISLAND_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.island,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.islandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
