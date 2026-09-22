import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/tokens';

type LogoProps = {
  size?: number;
};

/** The "One More" wordmark - heavier weight and tight tracking so it reads as a logo
 * rather than a screen title, with the period picking up the active source's accent
 * color (the one saturated color in an otherwise monochrome UI). */
export function Logo({ size = 32 }: LogoProps) {
  return (
    <Text style={[styles.wordmark, { fontSize: size }]}>
      One More
      <Text style={[styles.dot, { color: colors.accent }]}>.</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    color: colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  dot: {
    fontWeight: '900',
  },
});
