import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProgress = {
  totalXP: number;
  totalShortsWatched: number;
  totalWatchTime: number;
  currentStreak: number;
  lastActiveDate: string | null;
  rewardedVideoIds: string[];
};

export const DEFAULT_USER_PROGRESS: UserProgress = {
  totalXP: 0,
  totalShortsWatched: 0,
  totalWatchTime: 0,
  currentStreak: 0,
  lastActiveDate: null,
  rewardedVideoIds: [],
};

const STORAGE_KEY = '@shorts-xp/user-progress';

export async function loadUserProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_USER_PROGRESS;
  }
}

export async function saveUserProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
