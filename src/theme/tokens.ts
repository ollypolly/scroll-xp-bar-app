/**
 * Shared design tokens - colors, spacing, radii, typography. Every screen/component
 * should read from here instead of hardcoding hex values, so the look stays consistent
 * and can be re-tuned in one place.
 */

/**
 * One More wraps a rotating cast of sources (just YouTube today). Each source gets one
 * "living" accent color, keyed off the site it's wrapping - everything else in the UI
 * stays neutral so this is the only saturated thing on screen. Add a new source's own
 * brand color here when a second one ships; DEFAULT_SOURCE picks which one is active
 * until the app actually supports switching between sources at runtime.
 */
export const SOURCE_ACCENTS = {
  youtube: '#ff0033',
} as const;

export const DEFAULT_SOURCE: keyof typeof SOURCE_ACCENTS = 'youtube';

export const colors = {
  background: '#0b0b10',
  surface: '#16161f',
  surfaceRaised: '#1e1e2a',
  border: 'rgba(255,255,255,0.08)',

  textPrimary: '#f5f5f7',
  textSecondary: 'rgba(245,245,247,0.68)',
  textMuted: 'rgba(245,245,247,0.4)',

  accent: SOURCE_ACCENTS[DEFAULT_SOURCE],
  accentStrong: '#cc0029',
  gold: '#fbbf24',
  like: '#ff375f',

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
