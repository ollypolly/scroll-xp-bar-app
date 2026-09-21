/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render (that's how RN's Animated API drives native-side interpolation); this predates and
 * is unrelated to the React Compiler assumptions this rule otherwise guards. */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useProgressStore } from '../store/progressStore';

/**
 * Reads directly from the progress store rather than taking currentXP/level as
 * props, so every screen that mounts it (onboarding, debug, shorts) stays in
 * sync without prop drilling.
 */
export function XPBar() {
  const level = useProgressStore((state) => state.level);
  const lastAward = useProgressStore((state) => state.lastAward);
  const clearLastAward = useProgressStore((state) => state.clearLastAward);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    if (lastAward == null) return;
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => clearLastAward());
  }, [lastAward, toastAnim, clearLastAward]);

  const widthInterpolated = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const headerBackground = levelFlashAnim.interpolate({ inputRange: [0, 1], outputRange: ['#1f1f2e', '#7c3aed'] });
  const toastTranslateY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  const toastStyle = { opacity: toastAnim, transform: [{ translateY: toastTranslateY }] };

  return (
    <View style={styles.container}>
      {lastAward != null && (
        <Animated.Text style={[styles.gainText, toastStyle]}>+{lastAward} XP</Animated.Text>
      )}
      <Animated.View style={[styles.header, { backgroundColor: headerBackground }]}>
        <Text style={styles.levelText}>LEVEL {level.level}</Text>
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, { width: widthInterpolated }]} />
      </View>
      <Text style={styles.xpText}>
        {level.xpIntoLevel.toLocaleString()} / {level.xpForNextLevel.toLocaleString()} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  gainText: {
    alignSelf: 'flex-end',
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  xpText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
});
