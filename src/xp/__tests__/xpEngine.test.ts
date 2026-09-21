import { calculateShortXP, calculateWatchPercentage } from '../xpEngine';
import { DEFAULT_XP_CONFIG } from '../xpConfig';

describe('calculateWatchPercentage', () => {
  it('computes position/duration as a percentage', () => {
    expect(calculateWatchPercentage(30, 60)).toBeCloseTo(50);
    expect(calculateWatchPercentage(58.3, 60)).toBeCloseTo(97.17, 1);
  });

  it('clamps to 100 when position exceeds duration', () => {
    expect(calculateWatchPercentage(70, 60)).toBe(100);
  });

  it('returns 0 for non-positive duration or position', () => {
    expect(calculateWatchPercentage(10, 0)).toBe(0);
    expect(calculateWatchPercentage(0, 60)).toBe(0);
    expect(calculateWatchPercentage(-5, 60)).toBe(0);
  });
});

describe('calculateShortXP', () => {
  it('awards 0 XP below the minimum watch percentage', () => {
    expect(calculateShortXP(10, DEFAULT_XP_CONFIG)).toBe(0);
    expect(calculateShortXP(19.9, DEFAULT_XP_CONFIG)).toBe(0);
  });

  it('awards XP proportional to watch percentage at/above the threshold', () => {
    expect(calculateShortXP(20, DEFAULT_XP_CONFIG)).toBe(20);
    expect(calculateShortXP(30, DEFAULT_XP_CONFIG)).toBe(30);
    expect(calculateShortXP(50, DEFAULT_XP_CONFIG)).toBe(50);
    expect(calculateShortXP(75, DEFAULT_XP_CONFIG)).toBe(75);
    expect(calculateShortXP(100, DEFAULT_XP_CONFIG)).toBe(100);
  });

  it('rounds to the nearest integer', () => {
    expect(calculateShortXP(33.3, DEFAULT_XP_CONFIG)).toBe(33);
    expect(calculateShortXP(33.6, DEFAULT_XP_CONFIG)).toBe(34);
  });

  it('respects a custom config', () => {
    const config = { minimumWatchPercentage: 50, baseXP: 0, maxXPPerShort: 40 };
    expect(calculateShortXP(49, config)).toBe(0);
    expect(calculateShortXP(50, config)).toBe(20);
    expect(calculateShortXP(100, config)).toBe(40);
  });
});
