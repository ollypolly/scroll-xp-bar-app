import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';

/** Marks onboarding complete and drops straight into the real feed - shared by every
 * step's "Skip" and by the final step's "Start scrolling". Steps navigate between each
 * other with `replace` (see each step file), so at any point there's only ever one
 * onboarding screen in history - `back()` from here always lands wherever onboarding
 * was entered from, whether that's the cold-launch redirect or the debug screen.
 *
 * A debug-triggered replay (see `debug.tsx`) shouldn't drop into `/shorts` at all - it's
 * a preview, so finishing it should just exit back to the debug screen. */
export function useFinishOnboarding() {
  const completeOnboarding = useProgressStore((state) => state.completeOnboarding);
  const isReplaying = useDebugStore((state) => state.isReplayingOnboarding);
  const setReplayingOnboarding = useDebugStore((state) => state.setReplayingOnboarding);

  return () => {
    completeOnboarding();
    if (isReplaying) {
      setReplayingOnboarding(false);
      router.back();
      return;
    }
    router.replace('/shorts');
  };
}

type OnboardingStepLayoutProps = {
  step: number;
  totalSteps: number;
  nextLabel?: string;
  onNext: () => void;
  /** Omit on the last step - there's nothing left to skip past. */
  onSkip?: () => void;
  children: React.ReactNode;
};

/** Shared chrome for each onboarding screen: progress dots + skip up top, scrollable
 * content in the middle, a persistent primary button at the bottom. Each step is its
 * own route so back/forward and deep-linking behave like any other screen, instead of
 * being simulated with in-component state. */
export function OnboardingStepLayout({
  step,
  totalSteps,
  nextLabel = 'Next',
  onNext,
  onSkip,
  children,
}: OnboardingStepLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
          ))}
        </View>
        {onSkip && (
          <TouchableOpacity onPress={onSkip} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>{nextLabel}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/** Text styles shared by every step's content - kept here instead of per-screen so the
 * five step files don't each redefine the same heading/body look. */
export const onboardingText = StyleSheet.create({
  stepBlock: {
    gap: spacing.sm,
  },
  heading: {
    ...typography.title,
    fontSize: 24,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    height: 32,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  skip: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
