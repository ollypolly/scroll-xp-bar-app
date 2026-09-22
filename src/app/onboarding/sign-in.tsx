import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { onboardingText, OnboardingStepLayout, useFinishOnboarding } from '../../components/OnboardingStepLayout';
import { colors, radii, spacing } from '../../theme/tokens';

const TOTAL_STEPS = 5;

/** Step 3/5: optional YouTube sign-in, reusing the same `/signin` WebView screen the
 * home screen's button uses - `Done` there just calls `router.back()`, which correctly
 * returns here regardless of where it was pushed from. */
export default function OnboardingSignInScreen() {
  const finish = useFinishOnboarding();

  return (
    <OnboardingStepLayout
      step={2}
      totalSteps={TOTAL_STEPS}
      onNext={() => router.push('/onboarding/ranks')}
      onSkip={finish}
    >
      <View style={onboardingText.stepBlock}>
        <Text style={onboardingText.heading}>Sign in to YouTube</Text>
        <Text style={onboardingText.body}>
          Optional — sign in so the feed matches your usual recommendations and you can like or
          subscribe as normal while you scroll.
        </Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/signin')}>
          <Text style={styles.signInButtonText}>Sign in with YouTube</Text>
        </TouchableOpacity>
        <Text style={onboardingText.body}>You can always do this later from the home screen instead.</Text>
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  signInButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
