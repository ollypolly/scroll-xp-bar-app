import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useProgressStore } from '../store/progressStore';
import { useYouTubeShortsBridge } from '../youtube/useYouTubeShortsBridge';
import { buildOverlayUpdateScript, buildXPGainScript, YOUTUBE_INJECTED_JAVASCRIPT } from '../youtube/youtubeInjection';
import { DEFAULT_XP_CONFIG } from '../xp/xpConfig';

const SHORTS_URL = 'https://www.youtube.com/shorts';

export default function ShortsScreen() {
  const webViewRef = useRef<WebView>(null);
  const { handleWebViewMessage } = useYouTubeShortsBridge(DEFAULT_XP_CONFIG);

  const level = useProgressStore((state) => state.level);
  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);

  // Push the current level/XP into the in-page overlay whenever it changes.
  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      buildOverlayUpdateScript({
        level: level.level,
        currentXP: level.currentLevelXP + level.xpIntoLevel,
        currentLevelXP: level.currentLevelXP,
        nextLevelXP: level.nextLevelXP,
      }),
    );
  }, [level]);

  // Trigger the in-page "+XX XP" toast once per award, then clear it.
  useEffect(() => {
    if (lastAward == null) return;
    webViewRef.current?.injectJavaScript(buildXPGainScript(lastAward));
    clearLastAward();
  }, [lastAward, clearLastAward]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <WebView
        ref={webViewRef}
        source={{ uri: SHORTS_URL }}
        injectedJavaScript={YOUTUBE_INJECTED_JAVASCRIPT}
        onMessage={handleWebViewMessage}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        style={styles.webview}
      />
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
});
