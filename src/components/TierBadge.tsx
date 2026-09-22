import { StyleSheet, Text } from 'react-native';

import type { MaterialSurface } from '../xp/badges';
import { radii } from '../theme/tokens';
import { RankSurface } from './RankSurface';

type TierBadgeProps = {
  surface: MaterialSurface;
  icon: string;
  size?: number;
};

/**
 * The one circular badge visual for a rank/prestige tier - material fill or gradient (via
 * `RankSurface`) plus its icon/numeral. `TierLadder`'s rows render this; anywhere else the
 * current rank or prestige needs to show as a real badge (not just colored text) should
 * reuse this instead of re-deriving the look.
 */
export function TierBadge({ surface, icon, size = 32 }: TierBadgeProps) {
  return (
    <RankSurface surface={surface} style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.icon, { fontSize: size * 0.375 }]}>{icon}</Text>
    </RankSurface>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  icon: {
    color: '#fff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
