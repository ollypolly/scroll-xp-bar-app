import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

// Synthesized placeholders (see scripts that generated them) - swap for licensed SFX later.
const XP_GAIN_SOUND = require('../../assets/sounds/xp-gain.wav');
const LEVEL_UP_SOUND = require('../../assets/sounds/level-up.wav');

/**
 * Short one-shot sound effects for XP gain and level-up. Each award/level-up
 * replays from the start even if the previous play hasn't finished. The play
 * functions are memoized so they're stable across re-renders - consumers key
 * effects off them.
 */
export function useEffectSounds() {
  const xpGainPlayer = useAudioPlayer(XP_GAIN_SOUND);
  const levelUpPlayer = useAudioPlayer(LEVEL_UP_SOUND);

  const playXPGain = useCallback(async () => {
    await xpGainPlayer.seekTo(0);
    xpGainPlayer.play();
  }, [xpGainPlayer]);

  const playLevelUp = useCallback(async () => {
    await levelUpPlayer.seekTo(0);
    levelUpPlayer.play();
  }, [levelUpPlayer]);

  return { playXPGain, playLevelUp };
}
