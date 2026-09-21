import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XPBar } from '../components/XPBar';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { canPrestige, getPrestigeInfo } from '../xp/badges';

export default function OnboardingScreen() {
  const isLoaded = useProgressStore((state) => state.isLoaded);
  const level = useProgressStore((state) => state.level);
  const prestige = useProgressStore((state) => state.progress.prestige);
  const prestigeUp = useProgressStore((state) => state.prestigeUp);

  const eligibleForPrestige = isLoaded && canPrestige(level.level, prestige);

  function handlePrestige() {
    const next = getPrestigeInfo(prestige + 1);
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
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Shorts XP</Text>
          <TouchableOpacity style={styles.accountButton} onPress={() => router.push('/signin')}>
            <Text style={styles.accountButtonText}>{'\u{1F464}'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.body}>
          Watch YouTube Shorts right here in the app. XP is only earned for Shorts you actually
          watch — swiping past hundreds of them earns nothing.
        </Text>
        <Text style={styles.body}>
          Watch at least 20% of a Short to start earning XP. Watch the whole thing for the full
          reward.
        </Text>

        {isLoaded ? <XPBar /> : null}

        {eligibleForPrestige && (
          <TouchableOpacity style={styles.prestigeButton} onPress={handlePrestige}>
            <Text style={styles.prestigeButtonText}>Prestige</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={() => router.push('/shorts')}>
          <Text style={styles.buttonText}>Start scrolling</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/debug')}>
          <Text style={styles.debugLink}>Developer debug screen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg + 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  accountButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButtonText: {
    fontSize: 18,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  debugLink: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
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
});
