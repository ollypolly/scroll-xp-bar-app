import { useMemo, useRef } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';

import { calculateWatchPercentage } from '../xp/xpEngine';
import type { XPConfig } from '../xp/xpConfig';
import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';
import { WatchSessionTracker } from '../watchSession/watchSessionManager';
import { YouTubeVideoProvider } from './youtubeDetector';
import { parseWebViewEvent } from './youtubeEvents';

/**
 * Wires the WebView message bridge to the watch-session/XP layer. Kept out of
 * ShortsScreen so the screen component stays presentational.
 */
export function useYouTubeShortsBridge(config: XPConfig) {
  const trackerRef = useRef<WatchSessionTracker | null>(null);
  const providerRef = useRef<YouTubeVideoProvider | null>(null);

  const awardXP = useProgressStore((state) => state.awardXP);
  const rewardedVideoIds = useProgressStore((state) => state.progress.rewardedVideoIds);
  const debug = useDebugStore();

  if (providerRef.current === null) {
    providerRef.current = new YouTubeVideoProvider();
  }
  if (trackerRef.current === null) {
    trackerRef.current = new WatchSessionTracker(rewardedVideoIds);
  }

  return useMemo(() => {
    function handleWebViewMessage(event: WebViewMessageEvent) {
      const parsed = parseWebViewEvent(event.nativeEvent.data);
      if (!parsed) return;

      debug.recordEventReceived();
      providerRef.current!.ingestEvent(parsed);

      const video = providerRef.current!.getCurrentVideo();
      debug.updateVideoState({
        videoId: video?.videoId ?? null,
        duration: video?.duration ?? null,
        position: video?.position ?? null,
        watchPercentage: video?.duration ? calculateWatchPercentage(video.position, video.duration) : null,
      });

      if (parsed.type === 'VIDEO_CHANGED') {
        debug.recordVideoChange();
        debug.logEvent(`VIDEO_CHANGED ${parsed.previousVideoId ?? '(none)'} -> ${parsed.videoId}`);
      } else if (parsed.type === 'VIDEO_STARTED') {
        debug.logEvent(`VIDEO_STARTED ${parsed.videoId}`);
      }

      const result = trackerRef.current!.handleEvent(parsed, config);
      if (!result) return;

      if (result.alreadyRewarded) {
        debug.logEvent(`SKIPPED ${result.videoId} (already rewarded)`);
      } else if (result.durationUnknown) {
        debug.logEvent(`SKIPPED ${result.videoId} (duration unknown)`);
      } else if (result.xpAwarded > 0) {
        debug.recordXPAward(result.xpAwarded);
        debug.logEvent(`AWARDED +${result.xpAwarded} XP (${result.watchPercentage.toFixed(1)}% watched)`);
        awardXP(result.videoId, result.xpAwarded, result.watchedSeconds);
      } else {
        debug.logEvent(`NO XP ${result.videoId} (${result.watchPercentage.toFixed(1)}% < threshold)`);
      }
    }

    return { handleWebViewMessage };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, awardXP]);
}
