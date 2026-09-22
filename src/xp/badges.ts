import { MAX_LEVEL } from './levelSystem';

/**
 * Military-insignia-inspired rank tiers, one per 10 levels (1-99, RuneScape's own cap).
 * `material` drives how the badge renders (see RankBadge): wood and metal tiers are a
 * flat `color`; gem tiers use `gradient` (dark -> bright highlight -> dark, for
 * LinearGradient) plus an animated shine sweep, so the escalation genuinely reads as
 * "boring plank" at level 1 building to "sparkling gemstone" by level 99.
 */
export type RankMaterial = 'wood' | 'metal' | 'gem';

/** Anything `RankSurface` can render as a background: a flat `color` for wood/metal, or
 * a `gradient` plus shine sweep for gem. Shared by rank tiers and prestige tiers so the
 * same "boring flat color escalating to sparkling gem" language applies to both. */
export type MaterialSurface = {
  material: RankMaterial;
  color: string;
  gradient?: readonly [string, string, string];
};

export type RankTier = MaterialSurface & {
  name: string;
  minLevel: number;
  maxLevel: number;
  icon: string;
};

export const RANK_TIERS: RankTier[] = [
  { name: 'Recruit', minLevel: 1, maxLevel: 10, material: 'wood', color: '#8a6a45', icon: '▲' },
  { name: 'Private', minLevel: 11, maxLevel: 20, material: 'wood', color: '#5c4128', icon: '▲▲' },
  { name: 'Corporal', minLevel: 21, maxLevel: 30, material: 'metal', color: '#c17a3d', icon: '★' },
  { name: 'Sergeant', minLevel: 31, maxLevel: 40, material: 'metal', color: '#8a9199', icon: '★★' },
  { name: 'Lieutenant', minLevel: 41, maxLevel: 50, material: 'metal', color: '#d8dde2', icon: '◆' },
  { name: 'Captain', minLevel: 51, maxLevel: 60, material: 'metal', color: '#f2c94c', icon: '◆◆' },
  {
    name: 'Major',
    minLevel: 61,
    maxLevel: 70,
    material: 'gem',
    color: '#2ecc71',
    gradient: ['#0b6b3a', '#7cffb2', '#0b6b3a'],
    icon: '✦',
  },
  {
    name: 'Colonel',
    minLevel: 71,
    maxLevel: 80,
    material: 'gem',
    color: '#3d8bff',
    gradient: ['#0d3f8f', '#9fd0ff', '#0d3f8f'],
    icon: '✦✦',
  },
  {
    name: 'General',
    minLevel: 81,
    maxLevel: 90,
    material: 'gem',
    color: '#ff3d5f',
    gradient: ['#8f0d2a', '#ff9fb0', '#8f0d2a'],
    icon: '❈',
  },
  {
    name: 'Commander',
    minLevel: 91,
    maxLevel: 99,
    material: 'gem',
    color: '#f5f5f7',
    gradient: ['#b9c4ff', '#ffffff', '#ffb9f8'],
    icon: '❈❈',
  },
];

export function getRankForLevel(level: number): RankTier {
  const clamped = Math.min(Math.max(Math.floor(level), 1), MAX_LEVEL);
  return RANK_TIERS.find((tier) => clamped >= tier.minLevel && clamped <= tier.maxLevel) ?? RANK_TIERS[0];
}

export type PrestigeTier = MaterialSurface & {
  prestige: number;
  numeral: string;
  name: string;
};

/** Prestiging resets level 1-99 back to 1 in exchange for a permanent, increasingly
 * elaborate emblem - up to 10 times, same shape as Call of Duty's prestige system. Same
 * material escalation as the rank ladder (flat metal building to shimmering gem), just
 * compressed into 10 steps instead of 99 levels. */
export const PRESTIGE_TIERS: PrestigeTier[] = [
  { prestige: 1, numeral: 'I', name: 'Bronze', material: 'metal', color: '#cd7f32' },
  { prestige: 2, numeral: 'II', name: 'Silver', material: 'metal', color: '#c0c0c0' },
  { prestige: 3, numeral: 'III', name: 'Gold', material: 'metal', color: '#ffd700' },
  {
    prestige: 4,
    numeral: 'IV',
    name: 'Diamond',
    material: 'gem',
    color: '#b9f2ff',
    gradient: ['#0d4f5c', '#b9f2ff', '#0d4f5c'],
  },
  {
    prestige: 5,
    numeral: 'V',
    name: 'Emerald',
    material: 'gem',
    color: '#50c878',
    gradient: ['#0b5c34', '#50c878', '#0b5c34'],
  },
  {
    prestige: 6,
    numeral: 'VI',
    name: 'Ruby',
    material: 'gem',
    color: '#ff6f61',
    gradient: ['#7a1f1a', '#ff6f61', '#7a1f1a'],
  },
  {
    prestige: 7,
    numeral: 'VII',
    name: 'Amethyst',
    material: 'gem',
    color: '#9b5de5',
    gradient: ['#3d1a6b', '#9b5de5', '#3d1a6b'],
  },
  {
    prestige: 8,
    numeral: 'VIII',
    name: 'Sapphire',
    material: 'gem',
    color: '#00bbf9',
    gradient: ['#04395c', '#00bbf9', '#04395c'],
  },
  {
    prestige: 9,
    numeral: 'IX',
    name: 'Pink Diamond',
    material: 'gem',
    color: '#f15bb5',
    gradient: ['#6b1a4f', '#f15bb5', '#6b1a4f'],
  },
  {
    prestige: 10,
    numeral: 'X',
    name: 'Prismatic',
    material: 'gem',
    color: '#f5f5f7',
    gradient: ['#b9c4ff', '#ffffff', '#ffb9f8'],
  },
];

export const MAX_PRESTIGE = PRESTIGE_TIERS.length;

export type PrestigeInfo = MaterialSurface & { prestige: number; label: string; name: string };

export function getPrestigeInfo(prestige: number): PrestigeInfo {
  const clamped = Math.min(Math.max(Math.floor(prestige), 0), MAX_PRESTIGE);
  if (clamped === 0) return { prestige: 0, label: '', name: '', material: 'metal', color: '' };
  const tier = PRESTIGE_TIERS[clamped - 1];
  return {
    prestige: clamped,
    label: `Prestige ${tier.numeral}`,
    name: tier.name,
    material: tier.material,
    color: tier.color,
    gradient: tier.gradient,
  };
}

export function canPrestige(level: number, prestige: number): boolean {
  return level >= MAX_LEVEL && prestige < MAX_PRESTIGE;
}
