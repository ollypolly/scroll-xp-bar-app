/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render (that's how RN's Animated API drives native-side interpolation); this predates and
 * is unrelated to the React Compiler assumptions this rule otherwise guards. */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useProgressStore } from '../store/progressStore';

/**
 * Reads directly from the progress store rather than taking currentXP/level as
 * props, so every screen that mounts it (onboarding, debug, shorts) stays in
 * sync without prop drilling. Styled as a self-contained translucent card so it
 * reads clearly as an overlay on top of the WebView, not just on a plain screen.
 */
export function XPBar() {
  const level = useProgressStore((state) => state.level);

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
  const headerBackground = levelFlashAnim.interpolate({ inputRange: [0, 1], outputRange: ['#1f1f2e', '#7c3aed'] });

  return (
    <View style={styles.container}>
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
    gap: 6,
    backgroundColor: 'rgba(15,15,20,0.55)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
