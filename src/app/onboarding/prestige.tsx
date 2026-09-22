import { Text, View } from 'react-native';

import { onboardingText, OnboardingStepLayout, useFinishOnboarding } from '../../components/OnboardingStepLayout';
import { TierLadder } from '../../components/TierLadder';
import { PRESTIGE_TIERS } from '../../xp/badges';

const TOTAL_STEPS = 5;

/** Step 5/5: the prestige ladder - last step, so "Next" finishes onboarding instead of
 * pushing another screen, and there's nothing left to skip past. */
export default function OnboardingPrestigeScreen() {
  const finish = useFinishOnboarding();

  return (
    <OnboardingStepLayout step={4} totalSteps={TOTAL_STEPS} nextLabel="Start scrolling" onNext={finish}>
      <View style={onboardingText.stepBlock}>
        <Text style={onboardingText.heading}>Prestige</Text>
        <Text style={onboardingText.body}>
          Hit level 99 and you can prestige — reset to level 1 in exchange for a permanent badge.
          Do it up to 10 times, and the badge gets flashier every time.
        </Text>
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
    </OnboardingStepLayout>
  );
}
