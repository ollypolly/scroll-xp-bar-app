import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_USER_PROGRESS, loadUserProgress, saveUserProgress } from '../persistence';

describe('persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns default progress when nothing has been saved', async () => {
    const progress = await loadUserProgress();
    expect(progress).toEqual(DEFAULT_USER_PROGRESS);
  });

  it('round-trips saved progress', async () => {
    const progress = {
      ...DEFAULT_USER_PROGRESS,
      totalXP: 4250,
      totalShortsWatched: 12,
      rewardedVideoIds: ['a', 'b'],
    };

    await saveUserProgress(progress);
    const loaded = await loadUserProgress();

    expect(loaded).toEqual(progress);
  });

  it('falls back to defaults for corrupted stored data', async () => {
    await AsyncStorage.setItem('@shorts-xp/user-progress', 'not json');
    const progress = await loadUserProgress();
    expect(progress).toEqual(DEFAULT_USER_PROGRESS);
  });

  it('treats progress saved before hasOnboarded existed as already onboarded if it has watch history', async () => {
    await AsyncStorage.setItem(
      '@shorts-xp/user-progress',
      JSON.stringify({ totalXP: 500, totalShortsWatched: 3 }),
    );
    const progress = await loadUserProgress();
    expect(progress.hasOnboarded).toBe(true);
  });

  it('does not mark a genuinely fresh install as onboarded', async () => {
    const progress = await loadUserProgress();
    expect(progress.hasOnboarded).toBe(false);
  });
});
