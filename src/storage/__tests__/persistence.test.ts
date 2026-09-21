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
});
