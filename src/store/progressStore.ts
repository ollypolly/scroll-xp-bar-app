import { create } from 'zustand';

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

type ProgressState = {
  progress: UserProgress;
  level: Level;
  isLoaded: boolean;
  /** XP amount from the most recent award, for the "+XX XP" toast. Cleared by the UI once shown. */
  lastAward: number | null;
  loadProgress: () => Promise<void>;
  awardXP: (videoId: string, xp: number, watchedSeconds: number) => void;
  clearLastAward: () => void;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: DEFAULT_USER_PROGRESS,
  level: getLevelFromXP(DEFAULT_USER_PROGRESS.totalXP),
  isLoaded: false,
  lastAward: null,

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
    const updated: UserProgress = {
      ...current,
      totalXP: current.totalXP + xp,
      totalShortsWatched: current.totalShortsWatched + 1,
      totalWatchTime: current.totalWatchTime + watchedSeconds,
      rewardedVideoIds: [...current.rewardedVideoIds, videoId],
    };
    set({ progress: updated, level: getLevelFromXP(updated.totalXP), lastAward: xp });
    void saveUserProgress(updated);
  },

  clearLastAward: () => set({ lastAward: null }),
}));
