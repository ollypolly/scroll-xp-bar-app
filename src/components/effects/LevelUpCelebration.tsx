/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render; see the same note in XPBar.tsx. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProgressStore } from '../../store/progressStore';
import type { LevelUpEvent } from '../../store/progressStore';
import { colors, radii, spacing } from '../../theme/tokens';
import { canPrestige, getPrestigeInfo, getRankForLevel, type RankTier } from '../../xp/badges';
import { MAX_LEVEL } from '../../xp/levelSystem';

/** Normal level-ups hold briefly then fade; hitting max level holds much longer so
 * there's a real window to tap the prestige hint before it dismisses itself. */
const HOLD_MS = 650;
const MAX_LEVEL_HOLD_MS = 3500;

type LevelUpCelebrationProps = {
  event: LevelUpEvent | null;
  onDone: () => void;
};

/** Full-screen celebratory flourish for crossing a level threshold: an expanding ring
 * behind a card that pops in with a spring, holds, then fades out. Calls out a rank
 * change or the level cap specifically, since those are the more significant crossings. */
export function LevelUpCelebration({ event, onDone }: LevelUpCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [displayLevel, setDisplayLevel] = useState<number | null>(null);
  const [displayRank, setDisplayRank] = useState<RankTier | null>(null);
  const [isNewRank, setIsNewRank] = useState(false);
  const [isMaxLevel, setIsMaxLevel] = useState(false);

  const prestige = useProgressStore((state) => state.progress.prestige);
  const prestigeUp = useProgressStore((state) => state.prestigeUp);

  const cardScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const lastEventIdRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.8, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      onDone();
    });
  }, [cardOpacity, cardScale, onDone]);

  useEffect(() => {
    if (!event || event.id === lastEventIdRef.current) return;
    lastEventIdRef.current = event.id;

    const rank = getRankForLevel(event.level);
    const atMaxLevel = event.level === MAX_LEVEL;
    setDisplayLevel(event.level);
    setDisplayRank(rank);
    setIsNewRank(event.level === rank.minLevel);
    setIsMaxLevel(atMaxLevel);
    setVisible(true);
    cardScale.setValue(0);
    cardOpacity.setValue(0);
    ringScale.setValue(0);
    ringOpacity.setValue(0.6);

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 140 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(ringScale, { toValue: 3, duration: 700, useNativeDriver: true }),
      Animated.timing(ringOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start(() => {
      Animated.sequence([
        Animated.delay(atMaxLevel ? MAX_LEVEL_HOLD_MS : HOLD_MS),
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(cardScale, { toValue: 0.8, duration: 250, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setVisible(false);
        onDone();
      });
    });
  }, [event, cardScale, cardOpacity, ringScale, ringOpacity, onDone]);

  function handlePrestigeTap() {
    const next = getPrestigeInfo(prestige + 1);
    Alert.alert(
      `Prestige to ${next.label}?`,
      'This resets your level back to 1 and starts your XP over - the prestige badge is permanent.',
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Prestige',
          style: 'destructive',
          onPress: () => {
            prestigeUp();
            dismiss();
          },
        },
      ],
    );
  }

  if (!visible || displayLevel == null) return null;

  const showPrestigeHint = isMaxLevel && canPrestige(displayLevel, prestige);

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
        <Text style={styles.label}>{isMaxLevel ? 'MAX LEVEL' : isNewRank ? 'RANK UP' : 'LEVEL UP'}</Text>
        <Text style={styles.level}>{displayLevel}</Text>
        {displayRank && (
          <Text style={[styles.rankName, { color: displayRank.color }]}>
            {displayRank.icon} {displayRank.name.toUpperCase()}
          </Text>
        )}
        {showPrestigeHint && (
          <Pressable style={styles.prestigeHint} onPress={handlePrestigeTap} hitSlop={8}>
            <Text style={styles.prestigeHintText}>Tap to prestige</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentStrong,
  },
  card: {
    backgroundColor: colors.scrim,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  level: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '900',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  prestigeHint: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
  },
  prestigeHintText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
});
