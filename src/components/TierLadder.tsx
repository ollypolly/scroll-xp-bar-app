import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';
import type { MaterialSurface } from '../xp/badges';
import { TierBadge } from './TierBadge';

type TierLadderItem = MaterialSurface & {
  key: string | number;
  icon: string;
  name: string;
  subtitle: string;
};

/** A vertical ladder of badges - used by onboarding's rank and prestige preview steps, and
 * the profile screen's full tier list, which are otherwise identical in shape (badge, name,
 * level/prestige subtitle). */
export function TierLadder({ items }: { items: TierLadderItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <TierBadge surface={item} icon={item.icon} />
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
