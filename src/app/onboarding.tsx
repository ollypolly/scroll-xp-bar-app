import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '../components/Logo';
import { OnboardingDemoFeed } from '../components/OnboardingDemoFeed';
import { RankSurface } from '../components/RankSurface';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { RANK_TIERS } from '../xp/badges';

const STEP_COUNT = 4;

/**
 * One-time, first-launch walkthrough: what the app is, how XP works, a real (boxed-down)
 * taste of the feed itself, then the full rank ladder as a preview of where levels go.
 * Gated by `progress.hasOnboarded` - see the redirect in the home screen (`index.tsx`).
 */
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useProgressStore((state) => state.completeOnboarding);

  function finish() {
    completeOnboarding();
    router.replace('/shorts');
  }

  function next() {
    if (step === STEP_COUNT - 1) {
      finish();
    } else {
      setStep(step + 1);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {Array.from({ length: STEP_COUNT }).map((_, index) => (
            <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
          ))}
        </View>
        {step < STEP_COUNT - 1 && (
          <TouchableOpacity onPress={finish} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.stepBlock}>
            <Logo size={40} />
            <Text style={styles.tagline}>just one more.</Text>
            <Text style={styles.body}>
              One More wraps your Shorts feed with a real leveling system, so the scrolling you
              already do actually adds up to something.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepBlock}>
            <Text style={styles.heading}>How it works</Text>
            <Text style={styles.body}>Watch at least 20% of a Short to start earning XP for it.</Text>
            <Text style={styles.body}>Watch the whole thing for the full reward — longer Shorts earn more.</Text>
            <Text style={styles.body}>Level up, climb the ranks, and prestige once you hit the cap.</Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepBlock}>
            <Text style={styles.heading}>Try it</Text>
            <Text style={styles.body}>This preview feed is not real Shorts, but the XP is — swipe up.</Text>
            <OnboardingDemoFeed />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepBlock}>
            <Text style={styles.heading}>The road ahead</Text>
            <Text style={styles.body}>Levels 1–99, the RuneScape level cap — ranks escalate as you climb.</Text>
            <View style={styles.rankList}>
              {RANK_TIERS.map((tier) => (
                <View key={tier.name} style={styles.rankRow}>
                  <RankSurface rank={tier} style={styles.rankBadge}>
                    <Text style={styles.rankIcon}>{tier.icon}</Text>
                  </RankSurface>
                  <View>
                    <Text style={styles.rankName}>{tier.name}</Text>
                    <Text style={styles.rankLevels}>
                      Lv {tier.minLevel}–{tier.maxLevel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={next}>
        <Text style={styles.buttonText}>{step === STEP_COUNT - 1 ? 'Start scrolling' : 'Next'}</Text>
      </TouchableOpacity>
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
  stepBlock: {
    gap: spacing.sm,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
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
  rankList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rankName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  rankLevels: {
    color: colors.textMuted,
    fontSize: 12,
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
