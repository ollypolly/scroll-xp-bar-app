export type XPConfig = {
  /** A Short must be watched to at least this percentage (0-100) before it earns any XP. */
  minimumWatchPercentage: number;
  /** Reserved for future per-video multipliers (e.g. creator bonuses); not used by the MVP formula. */
  baseXP: number;
  /**
   * XP per second of playback reached. XP is proportional to actual watch time, not just
   * watch percentage, so a fully-watched 90s Short earns more than a fully-watched 15s one
   * - below minimumWatchPercentage it's still 0, same as before.
   */
  xpPerSecond: number;
};

// 2 XP/sec means a ~50s Short (roughly typical for the format) fully watched earns ~100
// XP, matching the level curve's calibration assumption.
export const DEFAULT_XP_CONFIG: XPConfig = {
  minimumWatchPercentage: 20,
  baseXP: 100,
  xpPerSecond: 2,
};
