export type LevelConfig = {
  /** xpRequiredForLevel(level) = xpStep * level * (level - 1) / 2 */
  xpStep: number;
};

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  xpStep: 1000,
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
  return (config.xpStep * level * (level - 1)) / 2;
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
