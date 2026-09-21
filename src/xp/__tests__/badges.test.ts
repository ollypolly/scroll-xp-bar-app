import { canPrestige, getPrestigeInfo, getRankForLevel, MAX_PRESTIGE, RANK_TIERS } from '../badges';
import { MAX_LEVEL } from '../levelSystem';

describe('getRankForLevel', () => {
  it('covers every level from 1 to the cap with no gaps', () => {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(getRankForLevel(level)).toBeDefined();
    }
  });

  it('returns the first tier for level 1 and the last tier for the max level', () => {
    expect(getRankForLevel(1)).toBe(RANK_TIERS[0]);
    expect(getRankForLevel(MAX_LEVEL)).toBe(RANK_TIERS[RANK_TIERS.length - 1]);
  });

  it('changes tier at each tier boundary', () => {
    expect(getRankForLevel(10)).not.toBe(getRankForLevel(11));
  });

  it('clamps out-of-range levels instead of throwing', () => {
    expect(getRankForLevel(0)).toBe(RANK_TIERS[0]);
    expect(getRankForLevel(9999)).toBe(RANK_TIERS[RANK_TIERS.length - 1]);
  });
});

describe('getPrestigeInfo', () => {
  it('has no label at prestige 0', () => {
    expect(getPrestigeInfo(0).label).toBe('');
  });

  it('labels each prestige with a roman numeral', () => {
    expect(getPrestigeInfo(1).label).toBe('Prestige I');
    expect(getPrestigeInfo(MAX_PRESTIGE).label).toBe('Prestige X');
  });

  it('clamps beyond the max prestige', () => {
    expect(getPrestigeInfo(MAX_PRESTIGE + 5)).toEqual(getPrestigeInfo(MAX_PRESTIGE));
  });
});

describe('canPrestige', () => {
  it('is false below the level cap', () => {
    expect(canPrestige(MAX_LEVEL - 1, 0)).toBe(false);
  });

  it('is true at the level cap with prestiges remaining', () => {
    expect(canPrestige(MAX_LEVEL, 0)).toBe(true);
  });

  it('is false once all prestiges are used', () => {
    expect(canPrestige(MAX_LEVEL, MAX_PRESTIGE)).toBe(false);
  });
});
