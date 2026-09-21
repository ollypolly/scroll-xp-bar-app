import { useProgressStore } from '../store/progressStore';
import { getLevelFromXP, MAX_LEVEL, xpRequiredForLevel } from './levelSystem';

let nextDebugVideoId = 1;

/**
 * Synthetic XP/level-up triggers shared by the debug panel (button taps), the fake-feed
 * simulator, and the "XP on scroll" / "Level up on scroll" debug settings on the real
 * Shorts screen - one implementation instead of three copies of the same math.
 */
export function awardDebugXP(amount?: number): void {
  const xp = amount ?? 20 + Math.floor(Math.random() * 80);
  useProgressStore.getState().awardXP(`debug-${nextDebugVideoId++}`, xp, 5);
}

export function forceDebugLevelUp(): void {
  const progress = useProgressStore.getState().progress;
  const current = getLevelFromXP(progress.totalXP);
  const needed = xpRequiredForLevel(current.level + 1) - progress.totalXP;
  awardDebugXP(Math.max(1, needed));
}

export function forceDebugMaxLevel(): void {
  const progress = useProgressStore.getState().progress;
  const needed = xpRequiredForLevel(MAX_LEVEL) - progress.totalXP;
  awardDebugXP(Math.max(1, needed));
}
