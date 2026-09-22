import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XPBar } from '../components/XPBar';
import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export default function DebugScreen() {
  const debug = useDebugStore();
  const progress = useProgressStore((state) => state.progress);
  const resetOnboarding = useProgressStore((state) => state.resetOnboarding);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <XPBar />
      </View>

      <TouchableOpacity style={styles.simulatorButton} onPress={() => router.push('/debug-shorts')}>
        <Text style={styles.simulatorButtonText}>Open Shorts simulator</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          debug.setReplayingOnboarding(true);
          router.push('/onboarding');
        }}
      >
        <Text style={styles.secondaryButtonText}>Replay onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          resetOnboarding();
          router.dismissTo('/');
        }}
      >
        <Text style={styles.secondaryButtonText}>Reset onboarding status</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.heading}>WebView Status</Text>
        <Text style={styles.line}>Current Video ID: {debug.currentVideoId ?? '-'}</Text>
        <Text style={styles.line}>Duration: {debug.duration != null ? `${debug.duration.toFixed(1)}s` : '-'}</Text>
        <Text style={styles.line}>Position: {debug.position != null ? `${debug.position.toFixed(1)}s` : '-'}</Text>
        <Text style={styles.line}>
          Watch %: {debug.watchPercentage != null ? `${debug.watchPercentage.toFixed(1)}%` : '-'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Current XP</Text>
        <Text style={styles.line}>{progress.totalXP.toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Last XP Award</Text>
        <Text style={styles.line}>{debug.lastXPAward != null ? `+${debug.lastXPAward} XP` : '-'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Detection</Text>
        <Text style={styles.line}>Video changes: {debug.videoChangeCount}</Text>
        <Text style={styles.line}>Events received: {debug.eventsReceivedCount}</Text>
      </View>

      <View style={[styles.section, styles.logSection]}>
        <Text style={styles.heading}>Event Log</Text>
        <FlatList
          data={debug.log}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Text style={styles.logLine}>
              {formatTime(item.timestamp)} {item.message}
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  logSection: {
    flex: 1,
  },
  heading: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  line: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  logLine: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  simulatorButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  simulatorButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
});
