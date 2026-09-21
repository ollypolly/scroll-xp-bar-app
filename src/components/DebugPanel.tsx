import { Modal, Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { canPrestige } from '../xp/badges';
import { awardDebugXP, forceDebugLevelUp, forceDebugMaxLevel } from '../xp/debugActions';

type DebugPanelProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Shared debug controls (XP/level-up/prestige triggers, scroll-driven toggles) used by
 * both the real Shorts screen and the fake-feed simulator. The toggles read/write the
 * persisted debug store, so flipping one on the simulator carries over to the real
 * screen (and back) and survives an app restart.
 */
export function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const insets = useSafeAreaInsets();
  const prestigeUp = useProgressStore((state) => state.prestigeUp);
  const totalXP = useProgressStore((state) => state.progress.totalXP);
  const prestige = useProgressStore((state) => state.progress.prestige);
  const level = useProgressStore((state) => state.level);

  const xpOnScroll = useDebugStore((state) => state.xpOnScroll);
  const levelUpOnScroll = useDebugStore((state) => state.levelUpOnScroll);
  const setXpOnScroll = useDebugStore((state) => state.setXpOnScroll);
  const setLevelUpOnScroll = useDebugStore((state) => state.setLevelUpOnScroll);

  const eligibleForPrestige = canPrestige(level.level, prestige);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.panel, { paddingBottom: insets.bottom + spacing.md }]} onPress={() => {}}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Debug controls</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.panelStat}>{totalXP.toLocaleString()} total XP</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => awardDebugXP()}>
              <Text style={styles.actionButtonText}>+XP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={forceDebugLevelUp}>
              <Text style={styles.actionButtonText}>Force level up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={forceDebugMaxLevel}>
              <Text style={styles.actionButtonText}>Force max level</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, !eligibleForPrestige && styles.actionButtonDisabled]}
              onPress={prestigeUp}
              disabled={!eligibleForPrestige}
            >
              <Text style={styles.actionButtonText}>Prestige</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>XP on scroll</Text>
            <Switch value={xpOnScroll} onValueChange={setXpOnScroll} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Level up on scroll</Text>
            <Switch value={levelUpOnScroll} onValueChange={setLevelUpOnScroll} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm + 2,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  closeButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  panelStat: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },
});
