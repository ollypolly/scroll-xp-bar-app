import { MAX_LEVEL } from './levelSystem';

/**
 * Military-insignia-inspired rank tiers, one per 10 levels (1-99, RuneScape's own cap).
 * `material` drives how the badge renders (see RankBadge): wood and metal tiers are a
 * flat `color`; gem tiers use `gradient` (dark -> bright highlight -> dark, for
 * LinearGradient) plus an animated shine sweep, so the escalation genuinely reads as
 * "boring plank" at level 1 building to "sparkling gemstone" by level 99.
 */
export type RankMaterial = 'wood' | 'metal' | 'gem';

export type RankTier = {
  name: string;
  minLevel: number;
  maxLevel: number;
  material: RankMaterial;
  color: string;
  gradient?: readonly [string, string, string];
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

/** Prestiging resets level 1-100 back to 1 in exchange for a permanent, increasingly
 * elaborate emblem - up to 10 times, same shape as Call of Duty's prestige system. */
export const MAX_PRESTIGE = 10;

const PRESTIGE_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const PRESTIGE_COLORS = [
  '#cd7f32',
  '#c0c0c0',
  '#ffd700',
  '#b9f2ff',
  '#50c878',
  '#ff6f61',
  '#9b5de5',
  '#00bbf9',
  '#f15bb5',
  '#f5f5f7',
];

export type PrestigeInfo = { prestige: number; label: string; color: string };

export function getPrestigeInfo(prestige: number): PrestigeInfo {
  const clamped = Math.min(Math.max(Math.floor(prestige), 0), MAX_PRESTIGE);
  if (clamped === 0) return { prestige: 0, label: '', color: '' };
  return {
    prestige: clamped,
    label: `Prestige ${PRESTIGE_NUMERALS[clamped - 1]}`,
    color: PRESTIGE_COLORS[clamped - 1],
  };
}

export function canPrestige(level: number, prestige: number): boolean {
  return level >= MAX_LEVEL && prestige < MAX_PRESTIGE;
}
