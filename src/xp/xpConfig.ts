export type XPConfig = {
  /** A Short must be watched to at least this percentage (0-100) before it earns any XP. */
  minimumWatchPercentage: number;
  /** Reserved for future per-video multipliers (e.g. creator bonuses); not used by the MVP formula. */
  baseXP: number;
  /** XP awarded for a 100%-watched Short; XP scales linearly down to 0 at minimumWatchPercentage. */
  maxXPPerShort: number;
};

export const DEFAULT_XP_CONFIG: XPConfig = {
  minimumWatchPercentage: 20,
  baseXP: 100,
  maxXPPerShort: 100,
};
