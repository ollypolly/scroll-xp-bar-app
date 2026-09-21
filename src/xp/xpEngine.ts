import type { XPConfig } from './xpConfig';

/**
 * Percentage of a Short watched, based on the furthest playback position reached
 * (not elapsed wall-clock time), clamped to [0, 100].
 */
export function calculateWatchPercentage(position: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (!Number.isFinite(position) || position <= 0) return 0;
  const percentage = (position / duration) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * XP for a single Short: 0 below the configured minimum watch percentage,
 * otherwise maxXPPerShort * watchPercentage / 100, rounded to the nearest integer.
 */
export function calculateShortXP(watchPercentage: number, config: XPConfig): number {
  const clamped = Math.min(100, Math.max(0, watchPercentage));
  if (clamped < config.minimumWatchPercentage) return 0;
  return Math.round((config.maxXPPerShort * clamped) / 100);
}
