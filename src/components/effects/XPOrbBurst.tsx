import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import type { AwardEvent } from '../../store/progressStore';

export type Point = { x: number; y: number };

type Orb = {
  id: number;
  anim: Animated.Value;
};

type XPOrbBurstProps = {
  award: AwardEvent | null;
  spawnPoint: Point;
  /** Where the orbs fly to - typically the on-screen position of the XP bar. Nothing
   * spawns until this has been measured. */
  targetPoint: Point | null;
  /** Fired once per orb as it lands, for a haptic "tick". */
  onOrbLanded?: () => void;
};

let nextOrbId = 1;

/**
 * Minecraft-style XP pickup: a small burst of glowing orbs flies from wherever the
 * Short was watched up into the XP bar. Purely decorative - the store already applied
 * the XP by the time this renders.
 */
export function XPOrbBurst({ award, spawnPoint, targetPoint, onOrbLanded }: XPOrbBurstProps) {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const lastAwardIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!award || !targetPoint || award.id === lastAwardIdRef.current) return;
    lastAwardIdRef.current = award.id;

    const orbCount = award.amount >= 60 ? 3 : award.amount >= 25 ? 2 : 1;
    const newOrbs: Orb[] = Array.from({ length: orbCount }, () => ({
      id: nextOrbId++,
      anim: new Animated.Value(0),
    }));
    setOrbs((current) => [...current, ...newOrbs]);

    newOrbs.forEach((orb, index) => {
      Animated.sequence([
        Animated.delay(index * 90),
        Animated.timing(orb.anim, { toValue: 1, duration: 480, useNativeDriver: true }),
      ]).start(() => {
        onOrbLanded?.();
        setOrbs((current) => current.filter((o) => o.id !== orb.id));
      });
    });
  }, [award, targetPoint, onOrbLanded]);

  if (!targetPoint) return null;

  const arcLift = 90;
  const midX = spawnPoint.x + (targetPoint.x - spawnPoint.x) * 0.5;
  const midY = Math.min(spawnPoint.y, targetPoint.y) - arcLift;

  return (
    <>
      {orbs.map((orb) => {
        const translateX = orb.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [spawnPoint.x, midX, targetPoint.x],
        });
        const translateY = orb.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [spawnPoint.y, midY, targetPoint.y],
        });
        const opacity = orb.anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
        const scale = orb.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });

        return (
          <Animated.View
            key={orb.id}
            pointerEvents="none"
            style={[styles.orb, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    left: -6,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
