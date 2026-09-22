/* eslint-disable react-hooks/refs -- Animated.Values held in refs are meant to be read during
 * render (that's how RN's Animated API drives interpolation); this predates and is unrelated
 * to the React Compiler assumptions this rule otherwise guards. */
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { getPrestigeInfo, getRankForLevel } from '../xp/badges';
import { RankSurface } from './RankSurface';
import { useProgressStore } from '../store/progressStore';
import { colors, formatCompactNumber, radii, shadow, spacing } from '../theme/tokens';

function compactLevelProgress(xpIntoLevel: number, xpForNextLevel: number, isMaxLevel: boolean): string {
  if (isMaxLevel) return 'MAX';
  return `${formatCompactNumber(xpIntoLevel)}/${formatCompactNumber(xpForNextLevel)} XP`;
}

const BADGE_SIZE = 24;
const PRESTIGE_CHIP_WIDTH = 28;
const MIN_COLLAPSED_WIDTH = 80;
const EXPANDED_WIDTH = 250;
export const ISLAND_HEIGHT = 40;
const HOLD_MS = 1800;

/**
 * A Dynamic-Island-style pill: collapsed, it's just the level badge and progress toward
 * the next level, so it stays out of the way while scrolling. Gaining XP or leveling up
 * expands it into a full progress bar for a couple of seconds, then it collapses back
 * down - the bar isn't permanently taking up screen space over the video. Collapsed and
 * expanded intentionally show the same number (this-level progress), just at different
 * detail - lifetime total XP lives on the profile screen instead.
 */
export function IslandXPBar() {
  const level = useProgressStore((state) => state.level);
  const prestige = useProgressStore((state) => state.progress.prestige);
  const lastAward = useProgressStore((state) => state.lastAward);
  const lastLevelUp = useProgressStore((state) => state.lastLevelUp);

  const rank = getRankForLevel(level.level);
  const prestigeInfo = getPrestigeInfo(prestige);

  const expandAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAwardIdRef = useRef<number | null>(null);
  const lastLevelUpIdRef = useRef<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // The collapsed pill hugs its content instead of using a fixed width, so there's no
  // dead space after a short XP amount (e.g. "120 XP" vs "999.9K XP").
  const [xpTextWidth, setXpTextWidth] = useState(40);
  const handleXpTextLayout = useCallback((event: LayoutChangeEvent) => {
    setXpTextWidth(event.nativeEvent.layout.width);
  }, []);

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
    setIsExpanded(true);
    Animated.spring(expandAnim, { toValue: 1, useNativeDriver: false, friction: 9, tension: 90 }).start();
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
      Animated.spring(expandAnim, { toValue: 0, useNativeDriver: false, friction: 9, tension: 90 }).start();
    }, HOLD_MS);
  }, [expandAnim]);

  // First tap manually opens the pill (same as an XP-award auto-expand); a second tap
  // while it's already open reads as "I want more detail" and goes to the full profile.
  const handlePress = useCallback(() => {
    if (isExpanded) {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      router.push('/profile');
    } else {
      expand();
    }
  }, [isExpanded, expand]);

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

  // A couple of px of slack over the measured text width - an exact fit leaves zero
  // margin for native rounding between the measurement pass and the actual render,
  // which was enough on its own to wrap "XP" onto a second line.
  const TEXT_WIDTH_SLACK = 4;

  const hasPrestige = prestige > 0;
  const collapsedWidth = Math.max(
    MIN_COLLAPSED_WIDTH,
    spacing.sm * 2 +
      BADGE_SIZE +
      spacing.sm +
      xpTextWidth +
      TEXT_WIDTH_SLACK +
      (hasPrestige ? PRESTIGE_CHIP_WIDTH + spacing.xs : 0),
  );
  const width = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [collapsedWidth, EXPANDED_WIDTH] });
  const collapsedOpacity = expandAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 0, 0] });
  const expandedOpacity = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <Animated.View style={[styles.island, shadow.island, { width }]}>
        <RankSurface surface={rank} flash={flashAnim} style={styles.badge}>
          <Text style={styles.badgeText}>{level.level}</Text>
        </RankSurface>

        {hasPrestige && (
          <View style={[styles.prestigeChip, { borderColor: prestigeInfo.color }]}>
            <Text style={[styles.prestigeChipText, { color: prestigeInfo.color }]}>{prestigeInfo.numeral}</Text>
          </View>
        )}

        {/* Measures the collapsed XP text's true single-line width, decoupled from the
            visible copy below - that one lives inside a box whose width is *derived from*
            this measurement, so measuring it directly would be circular (it'd report back
            whatever width it was already squeezed into, never its actual desired size). */}
        <Text
          style={[styles.compactXpText, styles.hiddenMeasure]}
          numberOfLines={1}
          onLayout={handleXpTextLayout}
        >
          {compactLevelProgress(level.xpIntoLevel, level.xpForNextLevel, level.isMaxLevel)}
        </Text>

        <View style={styles.contentStack}>
          <Animated.View style={[styles.collapsedContent, { opacity: collapsedOpacity }]} pointerEvents="none">
            <Text style={styles.compactXpText} numberOfLines={1}>
              {compactLevelProgress(level.xpIntoLevel, level.xpForNextLevel, level.isMaxLevel)}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.expandedContent, { opacity: expandedOpacity }]} pointerEvents="none">
            <View style={styles.track}>
              <Animated.View style={[styles.progress, { width: progressWidth }]} />
            </View>
            <Text style={styles.xpText}>
              {level.isMaxLevel
                ? 'MAX LEVEL'
                : `${level.xpIntoLevel.toLocaleString()} / ${level.xpForNextLevel.toLocaleString()} XP`}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  island: {
    height: ISLAND_HEIGHT,
    alignSelf: 'flex-start',
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
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  prestigeChip: {
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prestigeChipText: {
    fontSize: 9,
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
    alignSelf: 'flex-start',
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  hiddenMeasure: {
    position: 'absolute',
    opacity: 0,
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
