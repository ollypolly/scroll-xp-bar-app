export type LevelConfig = {
  /**
   * RuneScape-style curve: for level L this sums floor(n + growthBase * 2^(n/growthRate))
   * for n = 1..L-1, divides by 4 (as in the original formula), then multiplies by `scale`
   * to fit our XP economy (a fully-watched Short awards at most 100 XP by default). Cheap
   * for the first few levels, then grows steeply — a handful of Shorts gets you from
   * level 1 to 2, but each later level costs dramatically more than the last.
   */
  growthBase: number;
  growthRate: number;
  scale: number;
};

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  growthBase: 300,
  growthRate: 7,
  scale: 3,
};

export type Level = {
  level: number;
  /** Total XP required to have reached the current level. */
  currentLevelXP: number;
  /** Total XP required to reach the next level. */
  nextLevelXP: number;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** XP needed to go from the current level to the next. */
  xpForNextLevel: number;
};

export function xpRequiredForLevel(level: number, config: LevelConfig = DEFAULT_LEVEL_CONFIG): number {
  if (level <= 1) return 0;
  let sum = 0;
  for (let n = 1; n < level; n++) {
    sum += Math.floor(n + config.growthBase * 2 ** (n / config.growthRate));
  }
  return Math.floor((sum / 4) * config.scale);
}

export function getLevelFromXP(totalXP: number, config: LevelConfig = DEFAULT_LEVEL_CONFIG): Level {
  const safeXP = Math.max(0, totalXP);
  let level = 1;
  while (xpRequiredForLevel(level + 1, config) <= safeXP) {
    level += 1;
  }

  const currentLevelXP = xpRequiredForLevel(level, config);
  const nextLevelXP = xpRequiredForLevel(level + 1, config);

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpIntoLevel: safeXP - currentLevelXP,
    xpForNextLevel: nextLevelXP - currentLevelXP,
  };
}
