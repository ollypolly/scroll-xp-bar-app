import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProgress = {
  totalXP: number;
  totalShortsWatched: number;
  totalWatchTime: number;
  currentStreak: number;
  lastActiveDate: string | null;
  rewardedVideoIds: string[];
  /** Number of times the level-100 cap has been reset for a new badge tier (0-10). */
  prestige: number;
  /** Whether the one-time onboarding flow has been completed. */
  hasOnboarded: boolean;
};

export const DEFAULT_USER_PROGRESS: UserProgress = {
  totalXP: 0,
  totalShortsWatched: 0,
  totalWatchTime: 0,
  currentStreak: 0,
  lastActiveDate: null,
  rewardedVideoIds: [],
  prestige: 0,
  hasOnboarded: false,
};

const STORAGE_KEY = '@shorts-xp/user-progress';

export async function loadUserProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROGRESS;
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_USER_PROGRESS, ...parsed };
    // Progress saved before `hasOnboarded` existed shouldn't retroactively see onboarding -
    // any existing watch history is proof enough that they're past it.
    if (parsed.hasOnboarded === undefined && (merged.totalShortsWatched > 0 || merged.totalXP > 0)) {
      merged.hasOnboarded = true;
    }
    return merged;
  } catch {
    return DEFAULT_USER_PROGRESS;
  }
}

export async function saveUserProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
