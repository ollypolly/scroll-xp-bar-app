import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEffectSounds } from '../audio/useEffectSounds';
import { ISLAND_HEIGHT, IslandXPBar } from '../components/IslandXPBar';
import { LevelUpCelebration } from '../components/effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from '../components/effects/XPOrbBurst';
import { levelUpHaptic, xpGainHaptic } from '../haptics';
import { canPrestige } from '../xp/badges';
import { getLevelFromXP, MAX_LEVEL, xpRequiredForLevel } from '../xp/levelSystem';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing, typography } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SPAWN_POINT: Point = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - 160 };

const FAKE_HUES = [265, 205, 145, 20, 330, 45, 190];
const FAKE_HANDLES = ['moss.wav', 'quietloop', 'nkr.studio', 'pixel.pal', 'dry.humor', 'lo.fi.lena'];
const FAKE_CAPTIONS = [
  'wait for it 😭',
  'this took way too many takes',
  'POV: it is somehow already done',
  'not me doing this again',
  'ok but the timing on this',
  'sending this to everyone I know',
];
let nextDebugVideoId = 1;

type FakeShort = { id: string; hue: number; handle: string; caption: string; likes: number; comments: number };

const FAKE_SHORTS: FakeShort[] = Array.from({ length: 40 }, (_, index) => ({
  id: `fake-${index}`,
  hue: FAKE_HUES[index % FAKE_HUES.length],
  handle: FAKE_HANDLES[index % FAKE_HANDLES.length],
  caption: FAKE_CAPTIONS[index % FAKE_CAPTIONS.length],
  likes: 400 + Math.floor(Math.random() * 25000),
  comments: 5 + Math.floor(Math.random() * 800),
}));

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

/**
 * A fake Shorts feed (no WebView, no network) for exercising the XP/level UI without
 * needing to actually scroll real YouTube Shorts. Toggle "XP on scroll" / "Level up on
 * scroll" in the debug popup to have swiping itself drive events, or just mash the buttons.
 */
export default function DebugShortsScreen() {
  const insets = useSafeAreaInsets();
  const { playXPGain, playLevelUp } = useEffectSounds();
  const awardXP = useProgressStore((state) => state.awardXP);
  const prestigeUp = useProgressStore((state) => state.prestigeUp);
  const totalXP = useProgressStore((state) => state.progress.totalXP);
  const prestige = useProgressStore((state) => state.progress.prestige);
  const level = useProgressStore((state) => state.level);
  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);
  const clearLastLevelUp = useProgressStore((state) => state.clearLastLevelUp);

  const [panelOpen, setPanelOpen] = useState(false);
  const [xpOnScroll, setXpOnScroll] = useState(false);
  const [levelUpOnScroll, setLevelUpOnScroll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
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

  const forceMaxLevel = useCallback(() => {
    const progress = useProgressStore.getState().progress;
    const needed = xpRequiredForLevel(MAX_LEVEL) - progress.totalXP;
    awardXP(`debug-${nextDebugVideoId++}`, Math.max(1, needed), 5);
  }, [awardXP]);

  const toggleLike = useCallback((id: string) => {
    setLikedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Stable identity (memoized, reads live toggle state from refs) - FlatList warns if
  // onViewableItemsChanged changes after mount.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const item = viewableItems[0];
      if (item?.index == null || item.index === lastIndexRef.current) return;
      lastIndexRef.current = item.index;
      setActiveIndex(item.index);
      if (xpOnScrollRef.current) awardRandomXP();
      if (levelUpOnScrollRef.current) forceLevelUp();
    },
    [awardRandomXP, forceLevelUp],
  );

  const orbTarget: Point = { x: SCREEN_WIDTH / 2, y: insets.top + spacing.md + ISLAND_HEIGHT / 2 };
  const activeShort = FAKE_SHORTS[activeIndex];
  const activeLiked = likedIds.has(activeShort.id);

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
        renderItem={({ item }) => <View style={[styles.card, { backgroundColor: `hsl(${item.hue}, 55%, 18%)` }]} />}
      />

      <View pointerEvents="box-none" style={styles.overlayLayer}>
        <View style={[styles.topRow, { top: insets.top + spacing.md }]}>
          <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitButtonText}>{'✕'}</Text>
          </TouchableOpacity>
          <View style={styles.islandSlot}>
            <IslandXPBar />
          </View>
          <TouchableOpacity style={styles.exitButton} onPress={() => setPanelOpen(true)}>
            <Text style={styles.exitButtonText}>{'⚙'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.caption, { bottom: insets.bottom + spacing.xl }]}>
          <Text style={styles.handle}>@{activeShort.handle}</Text>
          <Text style={styles.captionText}>{activeShort.caption}</Text>
        </View>

        <View style={[styles.actionRail, { bottom: insets.bottom + spacing.xl }]}>
          <TouchableOpacity style={styles.railItem} onPress={() => toggleLike(activeShort.id)}>
            <Text style={[styles.railIcon, activeLiked && styles.railIconLiked]}>
              {activeLiked ? '❤️' : '\u{1F90D}'}
            </Text>
            <Text style={styles.railCount}>{formatCount(activeShort.likes + (activeLiked ? 1 : 0))}</Text>
          </TouchableOpacity>
          <View style={styles.railItem}>
            <Text style={styles.railIcon}>{'\u{1F4AC}'}</Text>
            <Text style={styles.railCount}>{formatCount(activeShort.comments)}</Text>
          </View>
          <View style={styles.railItem}>
            <Text style={styles.railIcon}>{'➡️'}</Text>
            <Text style={styles.railCount}>Share</Text>
          </View>
        </View>

        <XPOrbBurst award={lastAward} spawnPoint={ORB_SPAWN_POINT} targetPoint={orbTarget} onOrbLanded={xpGainHaptic} />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />

      <Modal visible={panelOpen} transparent animationType="slide" onRequestClose={() => setPanelOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPanelOpen(false)}>
          <Pressable style={[styles.panel, { paddingBottom: insets.bottom + spacing.md }]} onPress={() => {}}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Debug controls</Text>
              <TouchableOpacity onPress={() => setPanelOpen(false)}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.panelStat}>{totalXP.toLocaleString()} total XP</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={awardRandomXP}>
                <Text style={styles.actionButtonText}>+XP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={forceLevelUp}>
                <Text style={styles.actionButtonText}>Force level up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={forceMaxLevel}>
                <Text style={styles.actionButtonText}>Force level 100</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, !canPrestige(level.level, prestige) && styles.actionButtonDisabled]}
                onPress={prestigeUp}
                disabled={!canPrestige(level.level, prestige)}
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
  },
  overlayLayer: {
    ...StyleSheet.absoluteFill,
  },
  topRow: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  islandSlot: {
    flex: 1,
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.island,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.islandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  caption: {
    position: 'absolute',
    left: spacing.lg,
    right: 84,
    gap: spacing.xs,
  },
  handle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  captionText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  actionRail: {
    position: 'absolute',
    right: spacing.md,
    alignItems: 'center',
    gap: spacing.lg,
  },
  railItem: {
    alignItems: 'center',
    gap: 2,
  },
  railIcon: {
    fontSize: 26,
  },
  railIconLiked: {
    transform: [{ scale: 1.05 }],
  },
  railCount: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
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
