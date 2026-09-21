/* eslint-disable react-hooks/refs -- Animated.Values held in refs are meant to be read during
 * render (that's how RN's Animated API drives interpolation); this predates and is unrelated
 * to the React Compiler assumptions this rule otherwise guards. */
import { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useProgressStore } from '../store/progressStore';
import { colors, formatCompactNumber, radii, shadow, spacing } from '../theme/tokens';

const COLLAPSED_WIDTH = 110;
const EXPANDED_WIDTH = 250;
export const ISLAND_HEIGHT = 40;
const HOLD_MS = 1800;

/**
 * A Dynamic-Island-style pill: collapsed, it's just the level badge and total XP so it
 * stays out of the way while scrolling. Gaining XP or leveling up expands it into a full
 * progress bar for a couple of seconds, then it collapses back down - the bar isn't
 * permanently taking up screen space over the video.
 */
export function IslandXPBar() {
  const level = useProgressStore((state) => state.level);
  const totalXP = useProgressStore((state) => state.progress.totalXP);
  const lastAward = useProgressStore((state) => state.lastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);

  const expandAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAwardIdRef = useRef<number | null>(null);
  const lastLevelUpIdRef = useRef<number | null>(null);

  const fraction = level.xpForNextLevel > 0 ? level.xpIntoLevel / level.xpForNextLevel : 1;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(1, Math.max(0, fraction)),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [fraction, progressAnim]);

  useEffect(() => {
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  const expand = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    Animated.spring(expandAnim, { toValue: 1, useNativeDriver: false, friction: 9, tension: 90 }).start();
    collapseTimer.current = setTimeout(() => {
      Animated.spring(expandAnim, { toValue: 0, useNativeDriver: false, friction: 9, tension: 90 }).start();
    }, HOLD_MS);
  }, [expandAnim]);

  useEffect(() => {
    if (lastAward == null || lastAward.id === lastAwardIdRef.current) return;
    lastAwardIdRef.current = lastAward.id;
    expand();
  }, [lastAward, expand]);

  useEffect(() => {
    if (lastLevelUp == null || lastLevelUp.id === lastLevelUpIdRef.current) return;
    lastLevelUpIdRef.current = lastLevelUp.id;
    expand();
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
      Animated.timing(flashAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
    ]).start();
  }, [lastLevelUp, expand, flashAnim]);

  const width = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_WIDTH, EXPANDED_WIDTH] });
  const collapsedOpacity = expandAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 0, 0] });
  const expandedOpacity = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const badgeBackground = flashAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.accent, colors.gold] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.island, shadow.island, { width }]}>
      <Animated.View style={[styles.badge, { backgroundColor: badgeBackground }]}>
        <Text style={styles.badgeText}>{level.level}</Text>
      </Animated.View>

      <View style={styles.contentStack}>
        <Animated.View style={[styles.collapsedContent, { opacity: collapsedOpacity }]} pointerEvents="none">
          <Text style={styles.compactXpText}>{formatCompactNumber(totalXP)} XP</Text>
        </Animated.View>

        <Animated.View style={[styles.expandedContent, { opacity: expandedOpacity }]} pointerEvents="none">
          <View style={styles.track}>
            <Animated.View style={[styles.progress, { width: progressWidth }]} />
          </View>
          <Text style={styles.xpText}>
            {level.xpIntoLevel.toLocaleString()} / {level.xpForNextLevel.toLocaleString()} XP
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  island: {
    height: ISLAND_HEIGHT,
    alignSelf: 'center',
    backgroundColor: colors.island,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.islandBorder,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  contentStack: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  collapsedContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  compactXpText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  expandedContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    gap: 3,
  },
  track: {
    height: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: radii.sm,
    backgroundColor: colors.accent,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
});
