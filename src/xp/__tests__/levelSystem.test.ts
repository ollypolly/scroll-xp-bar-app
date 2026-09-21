import { DEFAULT_LEVEL_CONFIG, getLevelFromXP, xpRequiredForLevel } from '../levelSystem';

describe('xpRequiredForLevel', () => {
  it('requires 0 XP for level 1', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it('is strictly increasing', () => {
    for (let level = 1; level < 20; level++) {
      expect(xpRequiredForLevel(level + 1)).toBeGreaterThan(xpRequiredForLevel(level));
    }
  });

  it('respects a custom xpStep', () => {
    expect(xpRequiredForLevel(3, { xpStep: 500 })).toBe(1500);
  });
});

describe('getLevelFromXP', () => {
  it('starts at level 1 with 0 XP', () => {
    const level = getLevelFromXP(0);
    expect(level.level).toBe(1);
    expect(level.currentLevelXP).toBe(0);
    expect(level.xpIntoLevel).toBe(0);
  });

  it('stays at the current level while below the next threshold', () => {
    const nextLevelXP = xpRequiredForLevel(2, DEFAULT_LEVEL_CONFIG);
    const level = getLevelFromXP(nextLevelXP - 1);
    expect(level.level).toBe(1);
  });

  it('levels up exactly at the threshold', () => {
    const nextLevelXP = xpRequiredForLevel(2, DEFAULT_LEVEL_CONFIG);
    const level = getLevelFromXP(nextLevelXP);
    expect(level.level).toBe(2);
    expect(level.xpIntoLevel).toBe(0);
  });

  it('reports XP remaining for the next level', () => {
    const level = getLevelFromXP(500);
    expect(level.level).toBe(1);
    expect(level.nextLevelXP).toBe(xpRequiredForLevel(2, DEFAULT_LEVEL_CONFIG));
    expect(level.xpForNextLevel).toBe(level.nextLevelXP - level.currentLevelXP);
  });

  it('never returns a negative level for negative XP', () => {
    const level = getLevelFromXP(-100);
    expect(level.level).toBe(1);
    expect(level.xpIntoLevel).toBe(0);
  });
});
