import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// ── Celestial Orb — glowing sphere with orbit ring + particles ──
function CelestialOrb() {
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slow orbit
    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 10000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    // Gentle pulse on the core
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={orbStyles.wrap}>
      {/* Outer soft glow */}
      <Animated.View style={[orbStyles.outerGlow, { transform: [{ scale: pulseAnim }] }]} />

      {/* Orbit ring with dots */}
      <Animated.View style={[orbStyles.orbitRing, { transform: [{ rotate: spin }] }]}>
        <View style={[orbStyles.orbitDot, orbStyles.orbitDotTop]} />
        <View style={[orbStyles.orbitDot, orbStyles.orbitDotBottom]} />
      </Animated.View>

      {/* Middle halo */}
      <Animated.View style={[orbStyles.middleHalo, { transform: [{ scale: pulseAnim }] }]} />

      {/* Core sphere */}
      <View style={orbStyles.core}>
        <View style={orbStyles.coreInner} />
        <View style={orbStyles.coreHighlight} />
      </View>

      {/* Tiny floating particles */}
      <View style={[orbStyles.particle, { top: 8, left: 22 }]} />
      <View style={[orbStyles.particle, orbStyles.particleMd, { top: 18, right: 14 }]} />
      <View style={[orbStyles.particle, { bottom: 12, left: 16 }]} />
      <View style={[orbStyles.particle, orbStyles.particleMd, { bottom: 22, right: 20 }]} />
    </View>
  );
}

const ORB_SIZE = 90;
const ORBIT_R = 56;
const orbStyles = StyleSheet.create({
  wrap: {
    width: ORB_SIZE, height: ORB_SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute', width: ORB_SIZE, height: ORB_SIZE, borderRadius: ORB_SIZE / 2,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  orbitRing: {
    position: 'absolute', width: ORBIT_R, height: ORBIT_R, borderRadius: ORBIT_R / 2,
    borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)',
    borderStyle: 'dashed',
  },
  orbitDot: {
    position: 'absolute', width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#818CF8',
  },
  orbitDotTop: { top: -3, left: '50%', marginLeft: -3 },
  orbitDotBottom: { bottom: -3, left: '50%', marginLeft: -3 },
  middleHalo: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  core: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#6366F1',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 8,
  },
  coreInner: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#818CF8',
  },
  coreHighlight: {
    position: 'absolute', top: 5, left: 7,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  particle: {
    position: 'absolute', width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: 'rgba(129, 140, 248, 0.5)',
  },
  particleMd: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(129, 140, 248, 0.35)' },
});

// Ring config — 6 rings, each slightly larger and more transparent
const RINGS = [
  { size: 160, color: 'rgba(99, 102, 241, 0.25)' },
  { size: 200, color: 'rgba(99, 102, 241, 0.18)' },
  { size: 245, color: 'rgba(99, 102, 241, 0.13)' },
  { size: 290, color: 'rgba(99, 102, 241, 0.09)' },
  { size: 340, color: 'rgba(99, 102, 241, 0.06)' },
  { size: 390, color: 'rgba(99, 102, 241, 0.03)' },
];

export default function LoaderScreen() {
  const router = useRouter();
  const [phaseIndex, setPhaseIndex] = useState(-1);

  // Each ring gets its own animated scale
  const ringAnims = useRef(RINGS.map(() => new Animated.Value(0.55))).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(10)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const skipFade = useRef(new Animated.Value(0)).current;

  // ── Haptic patterns ──
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const inhaleHaptics = () => {
    if (!mountedRef.current) return;
    // Starts fast (150ms gaps), gradually slows down (500ms gaps) — like a deep breath building
    const taps: [number, Haptics.ImpactFeedbackStyle][] = [
      [0, Haptics.ImpactFeedbackStyle.Light],
      [150, Haptics.ImpactFeedbackStyle.Light],
      [300, Haptics.ImpactFeedbackStyle.Light],
      [500, Haptics.ImpactFeedbackStyle.Medium],
      [700, Haptics.ImpactFeedbackStyle.Medium],
      [950, Haptics.ImpactFeedbackStyle.Medium],
      [1250, Haptics.ImpactFeedbackStyle.Medium],
      [1600, Haptics.ImpactFeedbackStyle.Heavy],
      [2000, Haptics.ImpactFeedbackStyle.Heavy],
      [2450, Haptics.ImpactFeedbackStyle.Heavy],
      [2950, Haptics.ImpactFeedbackStyle.Heavy],
      [3500, Haptics.ImpactFeedbackStyle.Heavy],
    ];
    taps.forEach(([delay, style]) => {
      setTimeout(() => { if (mountedRef.current) Haptics.impactAsync(style); }, delay);
    });
  };

  const exhaleHaptics = () => {
    if (!mountedRef.current) return;
    // Starts fast (150ms gaps), gradually slows down (500ms gaps) — like a slow release
    const taps: [number, Haptics.ImpactFeedbackStyle][] = [
      [0, Haptics.ImpactFeedbackStyle.Heavy],
      [150, Haptics.ImpactFeedbackStyle.Heavy],
      [300, Haptics.ImpactFeedbackStyle.Heavy],
      [500, Haptics.ImpactFeedbackStyle.Medium],
      [700, Haptics.ImpactFeedbackStyle.Medium],
      [950, Haptics.ImpactFeedbackStyle.Medium],
      [1250, Haptics.ImpactFeedbackStyle.Medium],
      [1600, Haptics.ImpactFeedbackStyle.Light],
      [2000, Haptics.ImpactFeedbackStyle.Light],
      [2450, Haptics.ImpactFeedbackStyle.Light],
      [2950, Haptics.ImpactFeedbackStyle.Light],
      [3500, Haptics.ImpactFeedbackStyle.Light],
    ];
    taps.forEach(([delay, style]) => {
      setTimeout(() => { if (mountedRef.current) Haptics.impactAsync(style); }, delay);
    });
  };

  // ── Breathing rings + haptics — synced from the same trigger ──
  useEffect(() => {
    const breatheCycle = () => {
      if (!mountedRef.current) return;

      // INHALE — rings expand + haptics fire together
      inhaleHaptics();
      const inhaleAnims = ringAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1.1 + i * 0.03,
          duration: 4000,
          delay: i * 80,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );

      Animated.parallel(inhaleAnims).start(() => {
        if (!mountedRef.current) return;

        // EXHALE — rings contract + haptics fire together
        exhaleHaptics();
        const exhaleAnims = ringAnims.map((anim, i) =>
          Animated.timing(anim, {
            toValue: 0.55,
            duration: 4000,
            delay: i * 80,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        );

        Animated.parallel(exhaleAnims).start();
      });
    };
    breatheCycle();
  }, []);

  // ── Logo + skip ──
  useEffect(() => {
    Animated.timing(logoFade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    setTimeout(() => Animated.timing(skipFade, { toValue: 1, duration: 600, useNativeDriver: true }).start(), 2000);
  }, []);

  // ── Text phases — single breath cycle ──
  const phases = [
    { text: 'Breathe in' },
    { text: 'You are in the right place' },
    { text: "Let's find a way through\nyour loans, together" },
  ];

  const showText = (index: number) => {
    setPhaseIndex(index);
    textFade.setValue(0);
    textSlide.setValue(10);
    Animated.parallel([
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(textSlide, { toValue: 0, friction: 8, tension: 30, useNativeDriver: true }),
    ]).start();
  };

  const hideText = () => {
    Animated.timing(textFade, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };

  useEffect(() => {
    let mounted = true;

    // Timeline — single breath cycle:
    // 0ms      — inhale starts → show "Breathe in"
    // 3500ms   — fade out "Breathe in"
    // 4000ms   — exhale starts → show "You are in the right place"
    // 5800ms   — fade out
    // 6200ms   — show "Let's resolve..."
    // 8000ms   — fade out → navigate

    const timers = [
      setTimeout(() => { if (mounted) showText(0); }, 0),                                          // Breathe in
      setTimeout(() => { if (mounted) hideText(); }, 3500),
      setTimeout(() => { if (mounted) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); showText(1); } }, 4000),  // You are in the right place
      setTimeout(() => { if (mounted) hideText(); }, 5800),
      setTimeout(() => { if (mounted) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); showText(2); } }, 6200),              // Let's resolve...
      setTimeout(() => { if (mounted) hideText(); }, 8000),
      setTimeout(() => { if (mounted) router.replace('/onboarding/signup'); }, 8800),
    ];

    return () => { mounted = false; timers.forEach(clearTimeout); };
  }, []);

  const phase = phaseIndex >= 0 ? phases[phaseIndex] : null;

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoFade }]}>
        <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* Center */}
      <View style={styles.center}>
        {/* Breathing rings */}
        {RINGS.map((ring, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: ring.size, height: ring.size, borderRadius: ring.size / 2,
              backgroundColor: ring.color,
              transform: [{ scale: ringAnims[i] }],
            }}
          />
        ))}

        {/* Orb — locked to center of rings */}
        <View style={styles.orbWrap}>
          <CelestialOrb />
        </View>

        {/* Text below rings */}
        <View style={styles.textArea}>
          {phase && (
            <Animated.View style={{ opacity: textFade, transform: [{ translateY: textSlide }] }}>
              <Text style={styles.phaseText}>{phase.text}</Text>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Skip */}
      <Animated.View style={[styles.skipWrap, { opacity: skipFade }]}>
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/onboarding/signup'); }}
          activeOpacity={0.6}
        >
          <Text style={styles.skipText}>SKIP  {'>>'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
  logoWrap: { paddingTop: 60, alignSelf: 'center', alignItems: 'center' },
  logo: { width: width * 0.85, height: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrap: { position: 'absolute', zIndex: 10 },
  textArea: { marginTop: 200, height: 60, justifyContent: 'center', alignItems: 'center' },
  phaseText: { fontSize: 22, fontWeight: '600', color: '#1A1A2E', textAlign: 'center', lineHeight: 30 },
  skipWrap: { paddingBottom: 50 },
  skipText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF', letterSpacing: 2 },
});
