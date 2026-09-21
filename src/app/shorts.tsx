import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { useEffectSounds } from '../audio/useEffectSounds';
import { DebugPanel } from '../components/DebugPanel';
import { ISLAND_HEIGHT, IslandXPBar } from '../components/IslandXPBar';
import { LevelUpCelebration } from '../components/effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from '../components/effects/XPOrbBurst';
import { levelUpHaptic, xpGainHaptic } from '../haptics';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';
import { useYouTubeShortsBridge } from '../youtube/useYouTubeShortsBridge';
import { YOUTUBE_INJECTED_JAVASCRIPT } from '../youtube/youtubeInjection';
import { SHORTS_URL, WEBVIEW_USER_AGENT } from '../youtube/webviewConfig';
import { DEFAULT_XP_CONFIG } from '../xp/xpConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SPAWN_POINT: Point = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 140 };

export default function ShortsScreen() {
  const webViewRef = useRef<WebView>(null);
  const { handleWebViewMessage } = useYouTubeShortsBridge(DEFAULT_XP_CONFIG);
  const { playXPGain, playLevelUp } = useEffectSounds();
  const insets = useSafeAreaInsets();

  const [onShortsPage, setOnShortsPage] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

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

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setOnShortsPage(navState.url.includes('youtube.com/shorts'));
  }, []);

  const orbTarget: Point = { x: SCREEN_WIDTH / 2, y: insets.top + spacing.md + ISLAND_HEIGHT / 2 };

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
          <View style={styles.islandSlot}>
            <IslandXPBar />
          </View>
          <TouchableOpacity style={styles.gearButton} onPress={() => setPanelOpen(true)}>
            <Text style={styles.gearButtonText}>{'⚙'}</Text>
          </TouchableOpacity>
        </View>

        {!onShortsPage && (
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + spacing.md + ISLAND_HEIGHT + spacing.sm }]}
            onPress={() => webViewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(SHORTS_URL)}; true;`)}
          >
            <Text style={styles.backButtonText}>Back to Shorts</Text>
          </TouchableOpacity>
        )}

        <XPOrbBurst award={lastAward} spawnPoint={ORB_SPAWN_POINT} targetPoint={orbTarget} onOrbLanded={xpGainHaptic} />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />

      <DebugPanel visible={panelOpen} onClose={() => setPanelOpen(false)} />
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
  islandSlot: {
    flex: 1,
  },
  gearButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.island,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.islandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
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
