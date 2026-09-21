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

// growthRate widened from RuneScape's real 7 (which doubles the per-level cost every
// 7 levels - a ~6700x swing from level 1 to 90) to 15, since our XP-per-Short rate is
// flat, unlike RS where better training methods speed up XP/hour as you level. At 7,
// squeezing the endpoint down to a sane total made mid-game levels cost less than one
// Short. At 15 the curve still compounds hard toward the cap - level 99 costs roughly
// 100x what level 10 does - while never letting a level cost less than a few Shorts.
// scale tuned so one full level 1->99 run costs ~460k XP - at ~100 XP/short average
// that's roughly 65-80 hours of watching, on par with a single RuneScape 99. Ten of
// those (to reach max prestige) lands in the same ballpark as nine RS 99s.
export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  growthBase: 300,
  growthRate: 15,
  scale: 3,
};

/** Levels cap at 99, RuneScape's own cap - reaching it unlocks prestiging back to level 1. */
export const MAX_LEVEL = 99;

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
  isMaxLevel: boolean;
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
  while (level < MAX_LEVEL && xpRequiredForLevel(level + 1, config) <= safeXP) {
    level += 1;
  }

  const isMaxLevel = level >= MAX_LEVEL;
  const currentLevelXP = xpRequiredForLevel(level, config);
  const nextLevelXP = isMaxLevel ? currentLevelXP : xpRequiredForLevel(level + 1, config);

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpIntoLevel: safeXP - currentLevelXP,
    xpForNextLevel: nextLevelXP - currentLevelXP,
    isMaxLevel,
  };
}
