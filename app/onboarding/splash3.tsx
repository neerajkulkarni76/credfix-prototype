import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Loan settlement / best offers animation
function SettlementAnimation() {
  const loanScale = useRef(new Animated.Value(0)).current;
  const loanAmount = useRef(new Animated.Value(0)).current;
  const arrowSlide = useRef(new Animated.Value(0)).current;
  const offerScale = useRef(new Animated.Value(0)).current;
  const offerAmount = useRef(new Animated.Value(0)).current;
  const savingsScale = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const celebScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loan card appears
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(loanScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
      // Count up loan amount
      Animated.timing(loanAmount, { toValue: 86200, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
    }, 400);

    // Arrow slides
    setTimeout(() => {
      Animated.timing(arrowSlide, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    }, 1200);

    // Offer card appears
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(offerScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
      Animated.timing(offerAmount, { toValue: 47000, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
    }, 1600);

    // Savings badge
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(savingsScale, { toValue: 1, friction: 3, tension: 60, useNativeDriver: true }).start();
    }, 2400);

    // Sparkle confetti
    setTimeout(() => {
      const sparkleAnim = (v: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(v, { toValue: 0, duration: 600, useNativeDriver: true }),
          ])
        ).start();
      };
      sparkleAnim(sparkle1, 0);
      sparkleAnim(sparkle2, 200);
      sparkleAnim(sparkle3, 400);
    }, 2600);

    // Celebration
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Animated.spring(celebScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
    }, 3000);
  }, []);

  const [loanDisplay, setLoanDisplay] = React.useState(0);
  const [offerDisplay, setOfferDisplay] = React.useState(0);

  useEffect(() => {
    const id1 = loanAmount.addListener(({ value }) => setLoanDisplay(Math.round(value)));
    const id2 = offerAmount.addListener(({ value }) => setOfferDisplay(Math.round(value)));
    return () => { loanAmount.removeListener(id1); offerAmount.removeListener(id2); };
  }, []);

  return (
    <View style={aStyles.container}>
      {/* Sparkles */}
      {[{ v: sparkle1, top: '8%', left: '8%' }, { v: sparkle2, top: '12%', right: '10%' }, { v: sparkle3, top: '45%', left: '6%' }].map((s, i) => (
        <Animated.View key={i} style={[aStyles.sparkle, { top: s.top, left: s.left, right: s.right, opacity: s.v, transform: [{ scale: s.v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }] } as any]}>
          <FontAwesome name="star" size={12} color="#FBBF24" />
        </Animated.View>
      ))}

      {/* Outstanding loan */}
      <Animated.View style={[aStyles.loanCard, { transform: [{ scale: loanScale }] }]}>
        <View style={aStyles.loanHeader}>
          <View style={aStyles.loanIconWrap}>
            <FontAwesome name="bank" size={14} color={Colors.alert} />
          </View>
          <Text style={aStyles.loanLabel}>Outstanding</Text>
        </View>
        <Text style={aStyles.loanAmount}>₹{loanDisplay.toLocaleString('en-IN')}</Text>
      </Animated.View>

      {/* Arrow */}
      <Animated.View style={{ opacity: arrowSlide, transform: [{ scale: arrowSlide }] }}>
        <FontAwesome name="arrow-down" size={20} color={Colors.primary} style={{ marginVertical: 4 }} />
      </Animated.View>

      {/* Settlement offer */}
      <Animated.View style={[aStyles.offerCard, { transform: [{ scale: offerScale }] }]}>
        <View style={aStyles.loanHeader}>
          <View style={[aStyles.loanIconWrap, { backgroundColor: '#EEF2FF' }]}>
            <FontAwesome name="handshake-o" size={14} color={Colors.primary} />
          </View>
          <Text style={[aStyles.loanLabel, { color: Colors.primary }]}>Settlement Offer</Text>
        </View>
        <Text style={[aStyles.loanAmount, { color: Colors.primary }]}>₹{offerDisplay.toLocaleString('en-IN')}</Text>
      </Animated.View>

      {/* Savings badge */}
      <Animated.View style={[aStyles.savingsBadge, { transform: [{ scale: savingsScale }] }]}>
        <Text style={aStyles.savingsText}>You save </Text>
        <Text style={aStyles.savingsAmount}>₹39,200</Text>
        <Text style={aStyles.savingsPercent}> (45%)</Text>
      </Animated.View>

      {/* Celebration - in flow, not absolute */}
      <Animated.View style={[aStyles.celebBadge, { transform: [{ scale: celebScale }] }]}>
        <FontAwesome name="trophy" size={13} color="#FBBF24" />
        <Text style={aStyles.celebText}>Best offer found for you</Text>
      </Animated.View>
    </View>
  );
}

const aStyles = StyleSheet.create({
  container: { width: width - 40, height: height * 0.38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', borderRadius: 24, overflow: 'hidden', paddingVertical: 16 },
  sparkle: { position: 'absolute', zIndex: 10 },
  loanCard: { backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, width: '75%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  loanHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loanIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  loanLabel: { fontSize: 11, fontWeight: '600', color: Colors.alert },
  loanAmount: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  offerCard: { backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, width: '75%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, borderWidth: 1.5, borderColor: Colors.primaryLight },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#166534', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, marginTop: 8 },
  savingsText: { fontSize: 12, color: Colors.white, fontWeight: '500' },
  savingsAmount: { fontSize: 14, color: Colors.white, fontWeight: '800' },
  savingsPercent: { fontSize: 11, color: '#86EFAC', fontWeight: '600' },
  celebBadge: { position: 'absolute', bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  celebText: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
});

export default function Splash3() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

      <SettlementAnimation />

      <Text style={styles.tagline}>
        We bring the <Text style={styles.highlight}>best loan closure{'\n'}offers for you</Text>
      </Text>

      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.cta} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/onboarding/intro'); }} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Get Started  →</Text>
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
  bottom: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingBottom: 28 },
  cta: { width: width - 40, paddingVertical: 17, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
