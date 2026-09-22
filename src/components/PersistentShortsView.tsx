import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { useEffectSounds } from '../audio/useEffectSounds';
import { levelUpHaptic } from '../haptics';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';
import { useYouTubeShortsBridge } from '../youtube/useYouTubeShortsBridge';
import { YOUTUBE_INJECTED_JAVASCRIPT } from '../youtube/youtubeInjection';
import { SHORTS_URL, WEBVIEW_USER_AGENT } from '../youtube/webviewConfig';
import { DEFAULT_XP_CONFIG } from '../xp/xpConfig';
import { ISLAND_HEIGHT, IslandXPBar } from './IslandXPBar';
import { LevelUpCelebration } from './effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from './effects/XPOrbBurst';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SPAWN_POINT: Point = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 140 };

/**
 * Renders the Shorts WebView outside the router's Stack entirely, as an overlay above
 * it that's shown/hidden by comparing the current pathname to `/shorts` - not by the
 * `/shorts` route mounting or unmounting a screen. A Stack screen gets unmounted (and
 * its WebView destroyed) the moment it's popped, which meant leaving Shorts and coming
 * back reloaded YouTube from scratch every time. Living here instead, the WebView is
 * created once on first visit and then just hidden/shown for the rest of the app
 * session, so "Start scrolling" resumes exactly where you left off.
 *
 * `src/app/shorts.tsx` is a placeholder route that renders nothing - it exists purely
 * so `router.push('/shorts')` / `back()` have something to navigate to, which is what
 * drives this view's visibility.
 */
export function PersistentShortsView() {
  const pathname = usePathname();
  const isActive = pathname === '/shorts';

  // Don't create the WebView (and start loading YouTube) until the user actually goes
  // to Shorts for the first time - but once created, never unmount it again. Adjusting
  // state directly during render (React's supported pattern for "remember something
  // about a previous render") avoids the extra render an effect-based version would
  // cost, and refs can't be read during render under this project's lint rules.
  const [hasBeenActive, setHasBeenActive] = useState(isActive);
  const [prevIsActive, setPrevIsActive] = useState(isActive);
  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    if (isActive) setHasBeenActive(true);
  }

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

  // Stop playback the moment this stops being the active screen, so leaving Shorts
  // doesn't leave a video (and its audio) running behind the home screen.
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

  // If we arrived here by pushing from another screen (the normal case, from the home
  // screen's "Start scrolling"), just pop back to it instead of pushing a second copy of
  // home onto the stack. Only falls through to a fresh navigation when there's nowhere to
  // go back to (e.g. this is the first route after onboarding replaced it).
  function goHome() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  if (!hasBeenActive) return null;

  return (
    <View style={[StyleSheet.absoluteFill, !isActive && styles.hidden]} pointerEvents={isActive ? 'auto' : 'none'}>
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
            <TouchableOpacity style={styles.homeButton} onPress={goHome}>
              <Ionicons name="home" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <IslandXPBar />
          </View>

          {!onShortsPage && (
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + spacing.md + ISLAND_HEIGHT + spacing.sm }]}
              onPress={() => webViewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(SHORTS_URL)}; true;`)}
            >
              <Text style={styles.backButtonText}>Back to Shorts</Text>
            </TouchableOpacity>
          )}

          <XPOrbBurst award={lastAward} spawnPoint={ORB_SPAWN_POINT} targetPoint={orbTarget} />
        </View>

        <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
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
  backButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.island,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.islandBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
