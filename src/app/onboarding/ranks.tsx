import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { onboardingText, OnboardingStepLayout, useFinishOnboarding } from '../../components/OnboardingStepLayout';
import { TierLadder } from '../../components/TierLadder';
import { RANK_TIERS } from '../../xp/badges';

const TOTAL_STEPS = 5;

/** Step 4/5: the rank ladder, levels 1-99. */
export default function OnboardingRanksScreen() {
  const finish = useFinishOnboarding();

  return (
    <OnboardingStepLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      onNext={() => router.push('/onboarding/prestige')}
      onSkip={finish}
    >
      <View style={onboardingText.stepBlock}>
        <Text style={onboardingText.heading}>The road ahead</Text>
        <Text style={onboardingText.body}>Levels 1–99, the RuneScape level cap — ranks escalate as you climb.</Text>
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
    </OnboardingStepLayout>
  );
}
