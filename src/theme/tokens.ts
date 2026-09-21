/**
 * Shared design tokens - colors, spacing, radii, typography. Every screen/component
 * should read from here instead of hardcoding hex values, so the look stays consistent
 * and can be re-tuned in one place.
 */

export const colors = {
  background: '#0b0b10',
  surface: '#16161f',
  surfaceRaised: '#1e1e2a',
  border: 'rgba(255,255,255,0.08)',

  textPrimary: '#f5f5f7',
  textSecondary: 'rgba(245,245,247,0.68)',
  textMuted: 'rgba(245,245,247,0.4)',

  accent: '#8b5cf6',
  accentStrong: '#7c3aed',
  gold: '#fbbf24',

  island: '#050505',
  islandBorder: 'rgba(255,255,255,0.14)',
  track: 'rgba(255,255,255,0.12)',

  scrim: 'rgba(0,0,0,0.75)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 32, fontWeight: '800' as const },
  heading: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  body: { fontSize: 15, lineHeight: 21 },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.4 },
  caption: { fontSize: 11 },
} as const;

export const shadow = {
  island: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
} as const;

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.max(0, Math.floor(value))}`;
}
