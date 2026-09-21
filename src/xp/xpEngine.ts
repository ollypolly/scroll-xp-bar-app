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
 * XP for a single Short: 0 below the configured minimum watch percentage, otherwise
 * xpPerSecond * seconds reached (clamped to duration) - proportional to actual watch
 * time, so a longer Short fully watched earns more than a shorter one fully watched.
 */
export function calculateShortXP(position: number, duration: number, config: XPConfig): number {
  const watchPercentage = calculateWatchPercentage(position, duration);
  if (watchPercentage < config.minimumWatchPercentage) return 0;
  const watchedSeconds = Math.min(Math.max(0, position), duration);
  return Math.round(config.xpPerSecond * watchedSeconds);
}
