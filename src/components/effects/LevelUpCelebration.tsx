/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render; see the same note in XPBar.tsx. */
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import type { LevelUpEvent } from '../../store/progressStore';

type LevelUpCelebrationProps = {
  event: LevelUpEvent | null;
  onDone: () => void;
};

/** Full-screen celebratory flourish for crossing a level threshold: an expanding ring
 * behind a card that pops in with a spring, holds, then fades out. */
export function LevelUpCelebration({ event, onDone }: LevelUpCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [displayLevel, setDisplayLevel] = useState<number | null>(null);

  const cardScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const lastEventIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!event || event.id === lastEventIdRef.current) return;
    lastEventIdRef.current = event.id;

    setDisplayLevel(event.level);
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
        Animated.delay(650),
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

  if (!visible || displayLevel == null) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
        <Text style={styles.label}>LEVEL UP</Text>
        <Text style={styles.level}>{displayLevel}</Text>
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
    backgroundColor: '#7c3aed',
  },
  card: {
    backgroundColor: 'rgba(20,16,32,0.9)',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  level: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
  },
});
