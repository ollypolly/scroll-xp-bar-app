/* eslint-disable react-hooks/refs -- Animated.Value held in a ref is meant to be read during
 * render; see the same note in XPBar.tsx. */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import type { MaterialSurface } from '../xp/badges';

type RankSurfaceProps = {
  surface: MaterialSurface;
  style?: StyleProp<ViewStyle>;
  /** 0-1 Animated.Value; briefly overlays white to call out a change (e.g. a level-up),
   * independent of the base material so it works the same on flat and gem tiers. */
  flash?: Animated.Value;
  children?: React.ReactNode;
};

/**
 * Renders a rank or prestige tier's material as a background: a flat fill for wood/metal
 * tiers, or a gradient with a looping diagonal shine sweep for gem tiers - so a tier
 * ladder genuinely reads as "plain plank/metal" building up to "sparkling gemstone" by
 * the top of it. Sizing/shape (circle badge vs. pill header) is up to the caller's `style`.
 */
export function RankSurface({ surface, style, flash, children }: RankSurfaceProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (surface.material !== 'gem') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [surface.material, shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 80] });

  return (
    <Animated.View style={[styles.base, style]}>
      {surface.material === 'gem' && surface.gradient ? (
        <LinearGradient
          colors={surface.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: surface.color }]} />
      )}

      {surface.material === 'gem' && (
        <Animated.View
          pointerEvents="none"
          style={[styles.shineWrap, { transform: [{ translateX: shimmerTranslate }, { rotate: '25deg' }] }]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.85)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {flash && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flash }]} />
      )}

      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  shineWrap: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 18,
  },
});
