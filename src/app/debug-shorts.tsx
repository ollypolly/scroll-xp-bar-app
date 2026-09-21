import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View, type ViewToken } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEffectSounds } from '../audio/useEffectSounds';
import { ISLAND_HEIGHT, IslandXPBar } from '../components/IslandXPBar';
import { LevelUpCelebration } from '../components/effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from '../components/effects/XPOrbBurst';
import { levelUpHaptic, xpGainHaptic } from '../haptics';
import { getLevelFromXP, xpRequiredForLevel } from '../xp/levelSystem';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SPAWN_POINT: Point = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 160 };

const FAKE_HUES = [265, 205, 145, 20, 330, 45, 190];
let nextDebugVideoId = 1;

type FakeShort = { id: string; hue: number };

const FAKE_SHORTS: FakeShort[] = Array.from({ length: 40 }, (_, index) => ({
  id: `fake-${index}`,
  hue: FAKE_HUES[index % FAKE_HUES.length],
}));

/**
 * A fake Shorts feed (no WebView, no network) for exercising the XP/level UI without
 * needing to actually scroll real YouTube Shorts. Toggle "XP on scroll" / "Level up on
 * scroll" to have swiping itself drive events, or just mash the buttons.
 */
export default function DebugShortsScreen() {
  const insets = useSafeAreaInsets();
  const { playXPGain, playLevelUp } = useEffectSounds();
  const awardXP = useProgressStore((state) => state.awardXP);
  const totalXP = useProgressStore((state) => state.progress.totalXP);
  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);
  const clearLastLevelUp = useProgressStore((state) => state.clearLastLevelUp);

  const [xpOnScroll, setXpOnScroll] = useState(false);
  const [levelUpOnScroll, setLevelUpOnScroll] = useState(false);
  const xpOnScrollRef = useRef(xpOnScroll);
  const levelUpOnScrollRef = useRef(levelUpOnScroll);
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    xpOnScrollRef.current = xpOnScroll;
  }, [xpOnScroll]);

  useEffect(() => {
    levelUpOnScrollRef.current = levelUpOnScroll;
  }, [levelUpOnScroll]);

  useEffect(() => {
    if (lastAward == null) return;
    void playXPGain();
    const timeout = setTimeout(clearLastAward, 600);
    return () => clearTimeout(timeout);
  }, [lastAward, playXPGain, clearLastAward]);

  useEffect(() => {
    if (lastLevelUp == null) return;
    levelUpHaptic();
    void playLevelUp();
  }, [lastLevelUp, playLevelUp]);

  const awardRandomXP = useCallback(() => {
    const amount = 20 + Math.floor(Math.random() * 80);
    awardXP(`debug-${nextDebugVideoId++}`, amount, 5);
  }, [awardXP]);

  const forceLevelUp = useCallback(() => {
    const progress = useProgressStore.getState().progress;
    const current = getLevelFromXP(progress.totalXP);
    const needed = xpRequiredForLevel(current.level + 1) - progress.totalXP;
    awardXP(`debug-${nextDebugVideoId++}`, Math.max(1, needed), 5);
  }, [awardXP]);

  // Stable identity (memoized, reads live toggle state from refs) - FlatList warns if
  // onViewableItemsChanged changes after mount.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const item = viewableItems[0];
      if (item == null || item.index === lastIndexRef.current) return;
      lastIndexRef.current = item.index;
      if (xpOnScrollRef.current) awardRandomXP();
      if (levelUpOnScrollRef.current) forceLevelUp();
    },
    [awardRandomXP, forceLevelUp],
  );

  const orbTarget: Point = { x: SCREEN_WIDTH / 2, y: insets.top + spacing.md + ISLAND_HEIGHT / 2 };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={FAKE_SHORTS}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index }) => (
          <View style={[styles.card, { backgroundColor: `hsl(${item.hue}, 55%, 18%)` }]}>
            <Text style={styles.cardLabel}>Fake Short #{index + 1}</Text>
            <Text style={styles.cardHint}>swipe up</Text>
          </View>
        )}
      />

      <View pointerEvents="box-none" style={styles.overlayLayer}>
        <View style={[styles.header, { top: insets.top + spacing.md }]}>
          <IslandXPBar />
        </View>

        <XPOrbBurst award={lastAward} spawnPoint={ORB_SPAWN_POINT} targetPoint={orbTarget} onOrbLanded={xpGainHaptic} />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />

      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close simulator</Text>
        </TouchableOpacity>

        <Text style={styles.panelStat}>{totalXP.toLocaleString()} total XP</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={awardRandomXP}>
            <Text style={styles.actionButtonText}>+XP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={forceLevelUp}>
            <Text style={styles.actionButtonText}>Force level up</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cardLabel: {
    ...typography.title,
    fontSize: 24,
    color: colors.textPrimary,
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm + 2,
  },
  closeButton: {
    alignSelf: 'flex-start',
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
