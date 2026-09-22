/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render; see the same note in XPBar.tsx. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, Text, View, type ViewToken } from 'react-native';

import { useEffectSounds } from '../audio/useEffectSounds';
import { levelUpHaptic, xpGainHaptic } from '../haptics';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';
import { awardDebugXP } from '../xp/debugActions';
import { ISLAND_HEIGHT, IslandXPBar } from './IslandXPBar';
import { LevelUpCelebration } from './effects/LevelUpCelebration';
import { type Point, XPOrbBurst } from './effects/XPOrbBurst';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 380;
const HUES = [265, 205, 145, 20, 330];
const CAPTIONS = ['wait for it', 'ok but the timing on this', 'sending this to everyone I know', 'not me doing this again', 'POV: it is already done'];
const DEMO_CARDS = HUES.map((hue, index) => ({ id: `demo-${index}`, hue, caption: CAPTIONS[index] }));

/**
 * A boxed-down, swipeable preview feed for onboarding - real XP, real level-up
 * celebration, just without a real video behind it. Each swipe awards genuine XP via
 * the same debugActions used by the dev simulator, so this isn't a mockup: whatever
 * happens here is already the user's real progress.
 */
export function OnboardingDemoFeed() {
  const { playXPGain, playLevelUp } = useEffectSounds();
  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);
  const clearLastLevelUp = useProgressStore((state) => state.clearLastLevelUp);

  const [hasSwiped, setHasSwiped] = useState(false);
  const hintOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lastAward == null) return;
    void playXPGain();
  }, [lastAward, playXPGain]);

  useEffect(() => {
    if (lastLevelUp == null) return;
    levelUpHaptic();
    void playLevelUp();
  }, [lastLevelUp, playLevelUp]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index == null) return;
      awardDebugXP();
      if (!hasSwiped) {
        setHasSwiped(true);
        Animated.timing(hintOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }
    },
    [hasSwiped, hintOpacity],
  );

  useEffect(() => {
    if (lastAward == null) return;
    const timeout = setTimeout(clearLastAward, 600);
    return () => clearTimeout(timeout);
  }, [lastAward, clearLastAward]);

  const orbTarget: Point = { x: SCREEN_WIDTH / 2, y: spacing.md + ISLAND_HEIGHT / 2 };
  const orbSpawn: Point = { x: SCREEN_WIDTH / 2, y: CARD_HEIGHT - 60 };

  return (
    <View style={styles.frame}>
      <FlatList
        data={DEMO_CARDS}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={CARD_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: `hsl(${item.hue}, 55%, 20%)` }]}>
            <Text style={styles.caption}>{item.caption}</Text>
          </View>
        )}
      />

      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={[styles.islandSlot, { top: spacing.md }]}>
          <IslandXPBar />
        </View>
        {!hasSwiped && (
          <Animated.View style={[styles.hint, { opacity: hintOpacity }]} pointerEvents="none">
            <Text style={styles.hintText}>{'swipe up ↑'}</Text>
          </Animated.View>
        )}
        <XPOrbBurst award={lastAward} spawnPoint={orbSpawn} targetPoint={orbTarget} onOrbLanded={xpGainHaptic} />
      </View>

      <LevelUpCelebration event={lastLevelUp} onDone={clearLastLevelUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: CARD_HEIGHT,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  card: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  islandSlot: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  hint: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
