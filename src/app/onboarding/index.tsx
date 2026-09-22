import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '../../components/Logo';
import { onboardingText, OnboardingStepLayout, useFinishOnboarding } from '../../components/OnboardingStepLayout';
import { colors } from '../../theme/tokens';

const TOTAL_STEPS = 5;

/** Step 1/5: what the app is. Gated by `progress.hasOnboarded` - see the redirect in
 * the home screen (`index.tsx`). */
export default function OnboardingWelcomeScreen() {
  const finish = useFinishOnboarding();

  return (
    <OnboardingStepLayout
      step={0}
      totalSteps={TOTAL_STEPS}
      onNext={() => router.push('/onboarding/how-it-works')}
      onSkip={finish}
    >
      <View style={onboardingText.stepBlock}>
        <Logo size={40} />
        <Text style={styles.tagline}>just one more.</Text>
        <Text style={onboardingText.body}>
          One More wraps your Shorts feed with a real leveling system, so the scrolling you
          already do actually adds up to something.
        </Text>
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  tagline: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
  },
});
