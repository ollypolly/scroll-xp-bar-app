import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, type ViewToken } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEffectSounds } from '../audio/useEffectSounds';
import { DebugPanel } from '../components/DebugPanel';
import { ISLAND_HEIGHT, IslandXPBar } from '../components/IslandXPBar';
import { LevelUpCelebration } from '../components/effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from '../components/effects/XPOrbBurst';
import { levelUpHaptic } from '../haptics';
import { useDebugStore } from '../store/debugStore';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';
import { awardDebugXP, forceDebugLevelUp } from '../xp/debugActions';

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
  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);
  const clearLastLevelUp = useProgressStore((state) => state.clearLastLevelUp);

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

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

  // Stable identity (reads live toggle state from the debug store, not component state) -
  // FlatList warns if onViewableItemsChanged changes after mount.
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const item = viewableItems[0];
    if (item?.index == null) return;
    setActiveIndex(item.index);
    const debug = useDebugStore.getState();
    if (debug.xpOnScroll) awardDebugXP();
    if (debug.levelUpOnScroll) forceDebugLevelUp();
  }, []);

  const orbTarget: Point = { x: SCREEN_WIDTH / 2, y: insets.top + spacing.md + ISLAND_HEIGHT / 2 };
  const activeShort = FAKE_SHORTS[activeIndex];
  const activeLiked = likedIds.has(activeShort.id);
  // The SafeAreaView pads top/bottom, so each "page" is shorter than the full screen -
  // size cards (and the paging snap interval) to the space actually available to the
  // FlatList, not the raw screen height, or paging drifts out of alignment.
  const pageHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        data={FAKE_SHORTS}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={pageHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { height: pageHeight, backgroundColor: `hsl(${item.hue}, 55%, 18%)` }]} />
        )}
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

        <XPOrbBurst award={lastAward} spawnPoint={ORB_SPAWN_POINT} targetPoint={orbTarget} />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />

      <DebugPanel visible={panelOpen} onClose={() => setPanelOpen(false)} />
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
});
