import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

function CallShieldAnimation() {
  // Incoming calls
  const call1Drop = useRef(new Animated.Value(-50)).current;
  const call1Opacity = useRef(new Animated.Value(0)).current;
  const call2Drop = useRef(new Animated.Value(-50)).current;
  const call2Opacity = useRef(new Animated.Value(0)).current;
  const call3Drop = useRef(new Animated.Value(-50)).current;
  const call3Opacity = useRef(new Animated.Value(0)).current;

  // Ring wobble
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  // Block marks
  const block1 = useRef(new Animated.Value(0)).current;
  const block2 = useRef(new Animated.Value(0)).current;
  const block3 = useRef(new Animated.Value(0)).current;

  // Shield
  const shieldScale = useRef(new Animated.Value(0)).current;
  const shieldGlow = useRef(new Animated.Value(0)).current;

  // Counter
  const counterScale = useRef(new Animated.Value(0)).current;
  const [callCount, setCallCount] = React.useState(0);

  // Success
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ringAnim = (v: Animated.Value) =>
      Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(v, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.5, duration: 80, useNativeDriver: true }),
        Animated.timing(v, { toValue: -0.5, duration: 80, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 60, useNativeDriver: true }),
        Animated.delay(2000),
      ]));

    // Call 1 drops in
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(call1Drop, { toValue: 0, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.timing(call1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      ringAnim(ring1).start();
    }, 300);

    // Call 2
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(call2Drop, { toValue: 0, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.timing(call2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      ringAnim(ring2).start();
    }, 700);

    // Call 3
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(call3Drop, { toValue: 0, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.timing(call3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      ringAnim(ring3).start();
    }, 1100);

    // Shield appears in center
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Animated.spring(shieldScale, { toValue: 1, friction: 3, tension: 60, useNativeDriver: true }).start();
      // Glow pulse
      Animated.loop(Animated.sequence([
        Animated.timing(shieldGlow, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shieldGlow, { toValue: 0.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])).start();
    }, 1600);

    // Block call 1
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(block1, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
      setCallCount(1);
    }, 2100);

    // Block call 2
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(block2, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
      setCallCount(2);
    }, 2500);

    // Block call 3
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(block3, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
      setCallCount(3);
    }, 2900);

    // Counter
    setTimeout(() => {
      Animated.spring(counterScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
    }, 2100);

    // Success badge
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(successScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
    }, 3300);
  }, []);

  const calls = [
    { name: 'Recovery Agent', number: '+91 98XX XXX 431', drop: call1Drop, opacity: call1Opacity, ring: ring1, block: block1 },
    { name: 'Collection Call', number: '+91 70XX XXX 892', drop: call2Drop, opacity: call2Opacity, ring: ring2, block: block2 },
    { name: 'Lender Call', number: '+91 88XX XXX 156', drop: call3Drop, opacity: call3Opacity, ring: ring3, block: block3 },
  ];

  return (
    <View style={aStyles.container}>
      {/* Call cards stacked vertically */}
      <View style={aStyles.callsColumn}>
        {calls.map((call, i) => (
          <Animated.View key={i} style={[aStyles.callCard, { transform: [{ translateY: call.drop }, { rotate: call.ring.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-4deg', '0deg', '4deg'] }) }], opacity: call.opacity }]}>
            <View style={aStyles.callIcon}>
              <FontAwesome name="phone" size={12} color={Colors.alert} />
            </View>
            <View style={aStyles.callInfo}>
              <Text style={aStyles.callName}>{call.name}</Text>
              <Text style={aStyles.callNumber}>{call.number}</Text>
            </View>
            <Animated.View style={[aStyles.handledMark, { transform: [{ scale: call.block }] }]}>
              <FontAwesome name="check" size={10} color={Colors.white} />
            </Animated.View>
          </Animated.View>
        ))}
      </View>

      {/* Shield centered below calls */}
      <Animated.View style={[aStyles.shieldArea, { transform: [{ scale: shieldScale }] }]}>
        {/* Glow ring */}
        <Animated.View style={[aStyles.glowRing, { opacity: shieldGlow }]} />
        <View style={aStyles.shieldCircle}>
          <FontAwesome name="shield" size={36} color={Colors.ctaGreen} />
          <View style={aStyles.shieldCheck}>
            <FontAwesome name="check" size={11} color={Colors.white} />
          </View>
        </View>
        {/* Counter */}
        <Animated.View style={[aStyles.counterBadge, { transform: [{ scale: counterScale }] }]}>
          <Text style={aStyles.counterText}>{callCount}</Text>
          <Text style={aStyles.counterLabel}>handled</Text>
        </Animated.View>
      </Animated.View>

      {/* Success footer - in flow, not absolute */}
      <Animated.View style={[aStyles.successBadge, { transform: [{ scale: successScale }] }]}>
        <FontAwesome name="check-circle" size={16} color={Colors.white} />
        <Text style={aStyles.successText}>All calls handled by Neytra</Text>
      </Animated.View>
    </View>
  );
}

const aStyles = StyleSheet.create({
  container: { width: width - 40, height: height * 0.38, backgroundColor: '#F0FDF4', borderRadius: 24, overflow: 'hidden', flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 16 },
  callsColumn: { flex: 1, justifyContent: 'center', gap: 8 },
  callCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 12, padding: 10, position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  callIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  callInfo: { marginLeft: 8, flex: 1 },
  callName: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  callNumber: { fontSize: 9, color: Colors.textMuted, marginTop: 1 },
  handledMark: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  shieldArea: { width: 100, alignItems: 'center', justifyContent: 'center' },
  glowRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(22, 163, 74, 0.12)' },
  shieldCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  shieldCheck: { position: 'absolute', top: 14, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  counterBadge: { marginTop: 8, backgroundColor: Colors.ctaGreen, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, alignItems: 'center' },
  counterText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  counterLabel: { fontSize: 9, fontWeight: '600', color: '#BBF7D0' },
  successBadge: {
    position: 'absolute', bottom: 12, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.ctaGreen, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16,
    shadowColor: Colors.ctaGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  successText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});

export default function Splash1() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

      <CallShieldAnimation />

      <Text style={styles.tagline}>
        We will <Text style={styles.highlight}>answer all your{'\n'}lender calls</Text>
      </Text>

      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.cta} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/onboarding/splash2'); }} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Next  →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/onboarding/intro')} style={styles.skipBtn} activeOpacity={0.6}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center' },
  logo: { width: 180, height: 56, marginTop: 12, marginBottom: 16 },
  tagline: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginTop: 24, paddingHorizontal: 24, lineHeight: 34 },
  highlight: { color: Colors.primary },
  dots: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  dotActive: { width: 28, backgroundColor: Colors.primary, borderRadius: 5 },
  bottom: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingBottom: 16 },
  cta: { width: width - 40, paddingVertical: 17, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center', marginBottom: 8 },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 10 },
  skipText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
