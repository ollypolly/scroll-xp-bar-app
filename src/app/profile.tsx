import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XPBar } from '../components/XPBar';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { canPrestige, getPrestigeInfo } from '../xp/badges';

function formatWatchTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Reached by tapping the island pill a second time while it's expanded - the fuller,
 * more permanent view of progress that doesn't fit in the transient overlay. */
export default function ProfileScreen() {
  const progress = useProgressStore((state) => state.progress);
  const level = useProgressStore((state) => state.level);
  const prestigeUp = useProgressStore((state) => state.prestigeUp);

  const eligibleForPrestige = canPrestige(level.level, progress.prestige);

  function handlePrestige() {
    const next = getPrestigeInfo(progress.prestige + 1);
    Alert.alert(
      `Prestige to ${next.label}?`,
      'This resets your level back to 1 and starts your XP over - the prestige badge is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Prestige', style: 'destructive', onPress: prestigeUp },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{'‹ Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <XPBar />

        {eligibleForPrestige && (
          <TouchableOpacity style={styles.prestigeButton} onPress={handlePrestige}>
            <Text style={styles.prestigeButtonText}>Prestige</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.totalShortsWatched.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Shorts watched</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatWatchTime(progress.totalWatchTime)}</Text>
            <Text style={styles.statLabel}>Watch time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.currentStreak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.prestige}</Text>
            <Text style={styles.statLabel}>Prestiges</Text>
          </View>
        </View>
      </View>
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
    gap: spacing.lg,
  },
  prestigeButton: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  prestigeButtonText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
