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
    expect(calculateShortXP(6, 60, DEFAULT_XP_CONFIG)).toBe(0); // 10%
    expect(calculateShortXP(11.94, 60, DEFAULT_XP_CONFIG)).toBe(0); // 19.9%
  });

  it('awards XP proportional to seconds watched at/above the threshold', () => {
    expect(calculateShortXP(12, 60, DEFAULT_XP_CONFIG)).toBe(24); // 20% of 60s
    expect(calculateShortXP(30, 60, DEFAULT_XP_CONFIG)).toBe(60); // 50% of 60s
    expect(calculateShortXP(60, 60, DEFAULT_XP_CONFIG)).toBe(120); // 100% of 60s
  });

  it('awards more XP for a longer Short fully watched than a shorter one', () => {
    const shortClip = calculateShortXP(15, 15, DEFAULT_XP_CONFIG);
    const longClip = calculateShortXP(90, 90, DEFAULT_XP_CONFIG);
    expect(longClip).toBeGreaterThan(shortClip);
    expect(longClip).toBe(shortClip * 6); // 6x the duration -> 6x the XP
  });

  it('rounds to the nearest integer', () => {
    const config = { minimumWatchPercentage: 20, baseXP: 0, xpPerSecond: 1 / 3 };
    expect(calculateShortXP(100, 100, config)).toBe(33); // 33.33... rounds down
    expect(calculateShortXP(101, 101, config)).toBe(34); // 33.66... rounds up
  });

  it('respects a custom config', () => {
    const config = { minimumWatchPercentage: 50, baseXP: 0, xpPerSecond: 2 };
    expect(calculateShortXP(49, 100, config)).toBe(0);
    expect(calculateShortXP(50, 100, config)).toBe(100);
    expect(calculateShortXP(100, 100, config)).toBe(200);
  });
});
