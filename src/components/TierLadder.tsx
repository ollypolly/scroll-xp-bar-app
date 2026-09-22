import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme/tokens';
import type { MaterialSurface } from '../xp/badges';
import { RankSurface } from './RankSurface';

type TierLadderItem = MaterialSurface & {
  key: string | number;
  icon: string;
  name: string;
  subtitle: string;
};

/** A vertical ladder of badges - used by onboarding's rank and prestige preview screens,
 * which are otherwise identical in shape (badge, name, level/prestige subtitle). */
export function TierLadder({ items }: { items: TierLadderItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <RankSurface surface={item} style={styles.badge}>
            <Text style={styles.icon}>{item.icon}</Text>
          </RankSurface>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
