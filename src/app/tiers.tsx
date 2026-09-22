import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TierLadder } from '../components/TierLadder';
import { PRESTIGE_TIERS, RANK_TIERS } from '../xp/badges';
import { colors, spacing, typography } from '../theme/tokens';

/** Reached by tapping the rank/prestige badge on the profile screen - the full ladder of
 * what's ahead, reusing the same `TierLadder` rows as onboarding's rank/prestige steps. */
export default function TiersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{'‹ Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ranks & Prestige</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Ranks</Text>
          <TierLadder
            items={RANK_TIERS.map((tier) => ({
              key: tier.name,
              icon: tier.icon,
              name: tier.name,
              subtitle: `Lv ${tier.minLevel}–${tier.maxLevel}`,
              material: tier.material,
              color: tier.color,
              gradient: tier.gradient,
            }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Prestige</Text>
          <TierLadder
            items={PRESTIGE_TIERS.map((tier) => ({
              key: tier.prestige,
              icon: tier.numeral,
              name: tier.name,
              subtitle: `Prestige ${tier.numeral}`,
              material: tier.material,
              color: tier.color,
              gradient: tier.gradient,
            }))}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
