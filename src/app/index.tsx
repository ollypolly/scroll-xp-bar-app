import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '../components/Logo';
import { XPBar } from '../components/XPBar';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { canPrestige, getPrestigeInfo } from '../xp/badges';

/** Returning-user status line under the "Welcome back" heading - the first-time
 * explanation of how XP works now lives in /onboarding, so this just reports where
 * you left off instead of re-explaining the rules every visit. */
function welcomeBackSubtext(
  totalShortsWatched: number,
  currentStreak: number,
  isMaxLevel: boolean,
  xpIntoLevel: number,
  xpForNextLevel: number,
  nextLevel: number,
  eligibleForPrestige: boolean,
): string {
  if (totalShortsWatched === 0) return 'Ready when you are.';
  if (isMaxLevel) return eligibleForPrestige ? 'Max level — ready to prestige.' : 'Max level reached.';
  const streakPrefix = currentStreak >= 2 ? `${currentStreak}-day streak. ` : '';
  return `${streakPrefix}${(xpForNextLevel - xpIntoLevel).toLocaleString()} XP to level ${nextLevel}.`;
}

/** The home screen. First-ever launch bounces straight to `/onboarding` instead - this
 * screen is what you land on for every visit after that. */
export default function HomeScreen() {
  const isLoaded = useProgressStore((state) => state.isLoaded);
  const hasOnboarded = useProgressStore((state) => state.progress.hasOnboarded);
  const totalShortsWatched = useProgressStore((state) => state.progress.totalShortsWatched);
  const currentStreak = useProgressStore((state) => state.progress.currentStreak);
  const level = useProgressStore((state) => state.level);
  const prestige = useProgressStore((state) => state.progress.prestige);
  const prestigeUp = useProgressStore((state) => state.prestigeUp);
  const isSignedInToYouTube = useProgressStore((state) => state.progress.isSignedInToYouTube);

  const eligibleForPrestige = isLoaded && canPrestige(level.level, prestige);

  useEffect(() => {
    if (isLoaded && !hasOnboarded) router.replace('/onboarding');
  }, [isLoaded, hasOnboarded]);

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

  // Redirecting to /onboarding - skip painting the home screen behind it.
  if (isLoaded && !hasOnboarded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Logo />
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.heading}>Welcome back.</Text>
          <Text style={styles.body}>
            {welcomeBackSubtext(
              totalShortsWatched,
              currentStreak,
              level.isMaxLevel,
              level.xpIntoLevel,
              level.xpForNextLevel,
              level.level + 1,
              eligibleForPrestige,
            )}
          </Text>
        </View>

        {isLoaded ? (
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/profile')}>
            <XPBar />
          </TouchableOpacity>
        ) : null}

        {eligibleForPrestige && (
          <TouchableOpacity style={styles.prestigeButton} onPress={handlePrestige}>
            <Text style={styles.prestigeButtonText}>Prestige</Text>
          </TouchableOpacity>
        )}

        {isSignedInToYouTube ? (
          <View style={styles.signedInRow}>
            <View style={styles.signedInBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
              <Text style={styles.signedInBadgeText}>Signed in to YouTube</Text>
            </View>
            <View style={styles.signedInActions}>
              <TouchableOpacity onPress={() => router.push('/signin')}>
                <Text style={styles.signedInActionText}>Change account</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push({ pathname: '/signin', params: { mode: 'logout' } })}>
                <Text style={styles.signedInActionText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/signin')}>
            <Text style={styles.signInButtonText}>Sign in to YouTube</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={() => router.dismissTo('/shorts')}>
          <Text style={styles.buttonText}>Start scrolling</Text>
        </TouchableOpacity>
        {process.env.EXPO_PUBLIC_SHOW_DEV_TOOLS === 'true' ? (
          <TouchableOpacity onPress={() => router.push('/debug')}>
            <Text style={styles.debugLink}>Developer debug screen</Text>
          </TouchableOpacity>
        ) : null}
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...typography.title,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
  signInButton: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  signInButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  signedInRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  signedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signedInBadgeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  signedInActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  signedInActionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
