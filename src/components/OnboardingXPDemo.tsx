/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render; see the same note in XPBar.tsx. */
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import type { LevelUpEvent } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';
import { LevelUpCelebration } from './effects/LevelUpCelebration';

const DEMO_LEVEL = 4;
const FILL_START = 0.55;
const FRAME_HEIGHT = 200;

/**
 * A fully sandboxed, one-shot preview: fills a local progress bar, then plays the same
 * `LevelUpCelebration` used everywhere else in the app - no reads or writes to the real
 * progress store, and it doesn't replay once it's played.
 */
export function OnboardingXPDemo() {
  const progressAnim = useRef(new Animated.Value(FILL_START)).current;
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(progressAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start(({ finished }) => {
        if (finished) setLevelUpEvent({ id: 1, level: DEMO_LEVEL });
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.frame}>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, { width: progressWidth }]} />
      </View>
      <LevelUpCelebration event={levelUpEvent} onDone={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: FRAME_HEIGHT,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
