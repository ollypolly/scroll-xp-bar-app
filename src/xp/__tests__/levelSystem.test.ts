import { DEFAULT_LEVEL_CONFIG, getLevelFromXP, xpRequiredForLevel } from '../levelSystem';
import { DEFAULT_XP_CONFIG } from '../xpConfig';

describe('xpRequiredForLevel', () => {
  it('requires 0 XP for level 1', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it('is strictly increasing', () => {
    for (let level = 1; level < 30; level++) {
      expect(xpRequiredForLevel(level + 1)).toBeGreaterThan(xpRequiredForLevel(level));
    }
  });

  it('grows steeply (each level costs more than the last, RuneScape-style)', () => {
    const step = (level: number) => xpRequiredForLevel(level + 1) - xpRequiredForLevel(level);
    expect(step(10)).toBeGreaterThan(step(2));
    expect(step(20)).toBeGreaterThan(step(10));
  });

  it('only takes a couple of fully-watched Shorts to reach level 2', () => {
    expect(xpRequiredForLevel(2)).toBeLessThanOrEqual(DEFAULT_XP_CONFIG.maxXPPerShort * 3);
  });

  it('respects a custom config', () => {
    expect(xpRequiredForLevel(3, { growthBase: 0, growthRate: 7, scale: 1 })).toBe(0);
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
    expect(level.nextLevelXP).toBe(xpRequiredForLevel(level.level + 1, DEFAULT_LEVEL_CONFIG));
    expect(level.xpForNextLevel).toBe(level.nextLevelXP - level.currentLevelXP);
  });

  it('never returns a negative level for negative XP', () => {
    const level = getLevelFromXP(-100);
    expect(level.level).toBe(1);
    expect(level.xpIntoLevel).toBe(0);
  });
});
