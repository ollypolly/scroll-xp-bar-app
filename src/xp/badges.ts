import { MAX_LEVEL } from './levelSystem';

/**
 * Military-insignia-inspired rank tiers, one per 10 levels (1-99, RuneScape's own cap).
 * Escalating icon complexity and metal/gem color, in the spirit of a Call of Duty-style
 * rank system, without reusing any of its actual names or artwork.
 */
export type RankTier = {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  icon: string;
};

export const RANK_TIERS: RankTier[] = [
  { name: 'Recruit', minLevel: 1, maxLevel: 10, color: '#a8734a', icon: '▲' },
  { name: 'Private', minLevel: 11, maxLevel: 20, color: '#c98b52', icon: '▲▲' },
  { name: 'Corporal', minLevel: 21, maxLevel: 30, color: '#c0c0c0', icon: '★' },
  { name: 'Sergeant', minLevel: 31, maxLevel: 40, color: '#e0e0e8', icon: '★★' },
  { name: 'Lieutenant', minLevel: 41, maxLevel: 50, color: '#f2c94c', icon: '◆' },
  { name: 'Captain', minLevel: 51, maxLevel: 60, color: '#ffd76a', icon: '◆◆' },
  { name: 'Major', minLevel: 61, maxLevel: 70, color: '#8fd3f4', icon: '✦' },
  { name: 'Colonel', minLevel: 71, maxLevel: 80, color: '#b6e3ff', icon: '✦✦' },
  { name: 'General', minLevel: 81, maxLevel: 90, color: '#7ee8e8', icon: '❈' },
  { name: 'Commander', minLevel: 91, maxLevel: 99, color: '#f5f5f7', icon: '❈❈' },
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
