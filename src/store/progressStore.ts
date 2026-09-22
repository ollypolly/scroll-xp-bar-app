import { create } from 'zustand';

import { canPrestige } from '../xp/badges';
import { getLevelFromXP, type Level } from '../xp/levelSystem';
import { DEFAULT_USER_PROGRESS, loadUserProgress, saveUserProgress, type UserProgress } from '../storage/persistence';

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextStreak(lastActiveDate: string | null, currentStreak: number): number {
  if (lastActiveDate === null) return 1;
  const today = todayDateString();
  if (lastActiveDate === today) return currentStreak;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return lastActiveDate === yesterday ? currentStreak + 1 : 1;
}

export type AwardEvent = { id: number; amount: number };
export type LevelUpEvent = { id: number; level: number };

let nextEventId = 1;

type ProgressState = {
  progress: UserProgress;
  level: Level;
  isLoaded: boolean;
  /** Most recent award, for the orb/toast animation. Each award gets a fresh id, even if
   * the amount repeats, so consumers keyed on it re-trigger every time. Cleared once shown. */
  lastAward: AwardEvent | null;
  /** Set only on the award that crosses a level threshold. Cleared once shown. */
  lastLevelUp: LevelUpEvent | null;
  loadProgress: () => Promise<void>;
  awardXP: (videoId: string, xp: number, watchedSeconds: number) => void;
  /** Resets level/XP back to 1 in exchange for the next prestige badge. No-op if not
   * eligible (must be at the level cap with prestiges remaining). */
  prestigeUp: () => void;
  clearLastAward: () => void;
  clearLastLevelUp: () => void;
  completeOnboarding: () => void;
  setSignedInToYouTube: (signedIn: boolean) => void;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: DEFAULT_USER_PROGRESS,
  level: getLevelFromXP(DEFAULT_USER_PROGRESS.totalXP),
  isLoaded: false,
  lastAward: null,
  lastLevelUp: null,

  loadProgress: async () => {
    const progress = await loadUserProgress();
    const progressWithStreak: UserProgress = {
      ...progress,
      currentStreak: nextStreak(progress.lastActiveDate, progress.currentStreak),
      lastActiveDate: todayDateString(),
    };
    set({ progress: progressWithStreak, level: getLevelFromXP(progressWithStreak.totalXP), isLoaded: true });
    await saveUserProgress(progressWithStreak);
  },

  awardXP: (videoId, xp, watchedSeconds) => {
    if (xp <= 0) return;
    const current = get().progress;
    const previousLevel = get().level;
    const updated: UserProgress = {
      ...current,
      totalXP: current.totalXP + xp,
      totalShortsWatched: current.totalShortsWatched + 1,
      totalWatchTime: current.totalWatchTime + watchedSeconds,
      rewardedVideoIds: [...current.rewardedVideoIds, videoId],
    };
    const newLevel = getLevelFromXP(updated.totalXP);
    const leveledUp = newLevel.level > previousLevel.level;

    set({
      progress: updated,
      level: newLevel,
      lastAward: { id: nextEventId++, amount: xp },
      lastLevelUp: leveledUp ? { id: nextEventId++, level: newLevel.level } : get().lastLevelUp,
    });
    void saveUserProgress(updated);
  },

  prestigeUp: () => {
    const current = get().progress;
    const level = get().level;
    if (!canPrestige(level.level, current.prestige)) return;

    const updated: UserProgress = { ...current, totalXP: 0, prestige: current.prestige + 1 };
    set({ progress: updated, level: getLevelFromXP(updated.totalXP) });
    void saveUserProgress(updated);
  },

  clearLastAward: () => set({ lastAward: null }),
  clearLastLevelUp: () => set({ lastLevelUp: null }),

  completeOnboarding: () => {
    const updated: UserProgress = { ...get().progress, hasOnboarded: true };
    set({ progress: updated });
    void saveUserProgress(updated);
  },

  setSignedInToYouTube: (signedIn) => {
    const current = get().progress;
    if (current.isSignedInToYouTube === signedIn) return;
    const updated: UserProgress = { ...current, isSignedInToYouTube: signedIn };
    set({ progress: updated });
    void saveUserProgress(updated);
  },
}));
