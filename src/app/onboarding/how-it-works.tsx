import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { onboardingText, OnboardingStepLayout, useFinishOnboarding } from '../../components/OnboardingStepLayout';
import { OnboardingXPDemo } from '../../components/OnboardingXPDemo';

const TOTAL_STEPS = 5;

/** Step 2/5: the XP rules, plus a sandboxed taste of the level-up moment. */
export default function OnboardingHowItWorksScreen() {
  const finish = useFinishOnboarding();

  return (
    <OnboardingStepLayout
      step={1}
      totalSteps={TOTAL_STEPS}
      onNext={() => router.push('/onboarding/sign-in')}
      onSkip={finish}
    >
      <View style={onboardingText.stepBlock}>
        <Text style={onboardingText.heading}>How it works</Text>
        <Text style={onboardingText.body}>Watch at least 20% of a Short to start earning XP for it.</Text>
        <Text style={onboardingText.body}>Watch the whole thing for the full reward — longer Shorts earn more.</Text>
        <Text style={onboardingText.body}>Level up, climb the ranks, and prestige once you hit the cap.</Text>
        <OnboardingXPDemo />
      </View>
    </OnboardingStepLayout>
  );
}
