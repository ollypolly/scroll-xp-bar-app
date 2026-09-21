/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render (that's how RN's Animated API drives native-side interpolation); this predates and
 * is unrelated to the React Compiler assumptions this rule otherwise guards. */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { getPrestigeInfo, getRankForLevel } from '../xp/badges';
import { useProgressStore } from '../store/progressStore';
import { colors, radii, spacing } from '../theme/tokens';

/**
 * A static, always-expanded level/XP summary card for screens that aren't overlaying
 * video content (home, debug) - the Shorts screen uses `IslandXPBar` instead, which
 * collapses down when there's nothing new to show.
 */
export function XPBar() {
  const level = useProgressStore((state) => state.level);
  const prestige = useProgressStore((state) => state.progress.prestige);

  const rank = getRankForLevel(level.level);
  const prestigeInfo = getPrestigeInfo(prestige);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const levelFlashAnim = useRef(new Animated.Value(0)).current;
  const previousLevelRef = useRef(level.level);

  const fraction = level.xpForNextLevel > 0 ? level.xpIntoLevel / level.xpForNextLevel : 1;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(1, Math.max(0, fraction)),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [fraction, progressAnim]);

  useEffect(() => {
    if (level.level > previousLevelRef.current) {
      previousLevelRef.current = level.level;
      Animated.sequence([
        Animated.timing(levelFlashAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(levelFlashAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ]).start();
    }
  }, [level.level, levelFlashAnim]);

  const widthInterpolated = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const headerBackground = levelFlashAnim.interpolate({ inputRange: [0, 1], outputRange: [rank.color, colors.gold] });

  return (
    <View style={styles.container}>
      <View style={styles.rankRow}>
        <Animated.View style={[styles.header, { backgroundColor: headerBackground }]}>
          <Text style={styles.levelText}>
            {rank.icon} {rank.name.toUpperCase()} · LV {level.level}
          </Text>
        </Animated.View>
        {prestige > 0 && (
          <Text style={[styles.prestigeText, { color: prestigeInfo.color }]}>{prestigeInfo.label}</Text>
        )}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, { width: widthInterpolated, backgroundColor: rank.color }]} />
      </View>
      <Text style={styles.xpText}>
        {level.isMaxLevel
          ? 'MAX LEVEL — ready to prestige'
          : `${level.xpIntoLevel.toLocaleString()} / ${level.xpForNextLevel.toLocaleString()} XP`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  header: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  levelText: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  prestigeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
