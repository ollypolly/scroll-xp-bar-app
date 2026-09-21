import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XPBar } from '../components/XPBar';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';

export default function OnboardingScreen() {
  const isLoaded = useProgressStore((state) => state.isLoaded);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Shorts XP</Text>
          <TouchableOpacity style={styles.accountButton} onPress={() => router.push('/signin')}>
            <Text style={styles.accountButtonText}>{'\u{1F464}'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.body}>
          Watch YouTube Shorts right here in the app. XP is only earned for Shorts you actually
          watch — swiping past hundreds of them earns nothing.
        </Text>
        <Text style={styles.body}>
          Watch at least 20% of a Short to start earning XP. Watch the whole thing for the full
          reward.
        </Text>

        {isLoaded ? <XPBar /> : null}

        <TouchableOpacity style={styles.button} onPress={() => router.push('/shorts')}>
          <Text style={styles.buttonText}>Start scrolling</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/debug')}>
          <Text style={styles.debugLink}>Developer debug screen</Text>
        </TouchableOpacity>
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
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  accountButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButtonText: {
    fontSize: 18,
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
});
