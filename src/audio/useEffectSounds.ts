import { useCallback } from 'react';

/**
 * Disabled: playing these (even inaudible placeholder tones) activates the app's audio
 * session, which was interrupting/pausing the Shorts WebView's own video playback on
 * every XP gain and level-up. No-op until there's a way to play a one-shot effect
 * without competing for audio focus with the video. Consumers are left untouched so
 * re-enabling later doesn't need call-site changes.
 */
export function useEffectSounds() {
  const playXPGain = useCallback(async () => {}, []);
  const playLevelUp = useCallback(async () => {}, []);

  return { playXPGain, playLevelUp };
}
