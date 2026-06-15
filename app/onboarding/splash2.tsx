import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

function LegalAnimation() {
  // Step 1: Notice arrives
  const noticeSlide = useRef(new Animated.Value(-60)).current;
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const alertScale = useRef(new Animated.Value(0)).current;

  // Step 2: Reply drafted & sent
  const replySlide = useRef(new Animated.Value(50)).current;
  const replyOpacity = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(0)).current;
  const sentBadgeScale = useRef(new Animated.Value(0)).current;

  // Step 3: Next steps / guidance
  const guideSlide = useRef(new Animated.Value(50)).current;
  const guideOpacity = useRef(new Animated.Value(0)).current;
  const step1Check = useRef(new Animated.Value(0)).current;
  const step2Check = useRef(new Animated.Value(0)).current;
  const step3Check = useRef(new Animated.Value(0)).current;

  // Connectors
  const connector1Opacity = useRef(new Animated.Value(0)).current;
  const connector2Opacity = useRef(new Animated.Value(0)).current;

  // Success banner
  const bannerScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Notice drops in
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(noticeSlide, { toValue: 0, friction: 5, tension: 45, useNativeDriver: true }),
        Animated.timing(noticeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }, 300);

    // Alert badge pops
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Animated.spring(alertScale, { toValue: 1, friction: 3, tension: 70, useNativeDriver: true }).start();
    }, 900);

    // Connector 1 appears
    setTimeout(() => {
      Animated.timing(connector1Opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, 1300);

    // Step 2: Reply card slides up
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(replySlide, { toValue: 0, friction: 5, tension: 45, useNativeDriver: true }),
        Animated.timing(replyOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 1500);

    // Stamp appears
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Animated.spring(stampScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }).start();
    }, 2100);

    // Sent badge
    setTimeout(() => {
      Animated.spring(sentBadgeScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    }, 2500);

    // Connector 2 appears
    setTimeout(() => {
      Animated.timing(connector2Opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, 2700);

    // Step 3: Guidance card slides up
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(guideSlide, { toValue: 0, friction: 5, tension: 45, useNativeDriver: true }),
        Animated.timing(guideOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 2900);

    // Checklist items appear one by one
    setTimeout(() => {
      Haptics.selectionAsync();
      Animated.spring(step1Check, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    }, 3300);
    setTimeout(() => {
      Haptics.selectionAsync();
      Animated.spring(step2Check, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    }, 3600);
    setTimeout(() => {
      Haptics.selectionAsync();
      Animated.spring(step3Check, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    }, 3900);

    // Success banner
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(bannerScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
    }, 4200);
  }, []);

  return (
    <View style={aStyles.container}>
      {/* Step 1: Notice */}
      <Animated.View style={[aStyles.noticeCard, { transform: [{ translateY: noticeSlide }], opacity: noticeOpacity }]}>
        <View style={aStyles.stepBadge}>
          <Text style={aStyles.stepNum}>1</Text>
        </View>
        <View style={aStyles.noticeIconWrap}>
          <FontAwesome name="envelope-open" size={18} color={Colors.alert} />
        </View>
        <View style={aStyles.cardContent}>
          <Text style={aStyles.cardTitle}>Legal Notice Received</Text>
          <Text style={aStyles.cardSub}>Section 25 · DBS Bank</Text>
        </View>
        <Animated.View style={[aStyles.alertDot, { transform: [{ scale: alertScale }] }]}>
          <FontAwesome name="exclamation" size={8} color={Colors.white} />
        </Animated.View>
      </Animated.View>

      {/* Connector 1 */}
      <Animated.View style={[aStyles.connector, { opacity: connector1Opacity }]}>
        <View style={aStyles.connectorLine} />
        <FontAwesome name="chevron-down" size={10} color={Colors.primary} />
      </Animated.View>

      {/* Step 2: Reply drafted & sent */}
      <Animated.View style={[aStyles.replyCard, { transform: [{ translateY: replySlide }], opacity: replyOpacity }]}>
        <View style={[aStyles.stepBadge, { backgroundColor: Colors.primary }]}>
          <Text style={aStyles.stepNum}>2</Text>
        </View>
        <View style={[aStyles.noticeIconWrap, { backgroundColor: '#EEF2FF' }]}>
          <FontAwesome name="file-text-o" size={18} color={Colors.primary} />
        </View>
        <View style={aStyles.cardContent}>
          <Text style={[aStyles.cardTitle, { color: Colors.primary }]}>Reply Drafted & Sent</Text>
          <View style={aStyles.replyLines}>
            <View style={[aStyles.line, { width: '100%' }]} />
            <View style={[aStyles.line, { width: '70%' }]} />
          </View>
        </View>
        {/* Stamp */}
        <Animated.View style={[aStyles.stamp, { transform: [{ scale: stampScale }, { rotate: '-12deg' }] }]}>
          <Text style={aStyles.stampText}>SENT</Text>
        </Animated.View>
        {/* Sent tick */}
        <Animated.View style={[aStyles.sentBadge, { transform: [{ scale: sentBadgeScale }] }]}>
          <FontAwesome name="check" size={8} color={Colors.white} />
        </Animated.View>
      </Animated.View>

      {/* Connector 2 */}
      <Animated.View style={[aStyles.connector, { opacity: connector2Opacity }]}>
        <View style={aStyles.connectorLine} />
        <FontAwesome name="chevron-down" size={10} color={Colors.primary} />
      </Animated.View>

      {/* Step 3: Guidance & next steps */}
      <Animated.View style={[aStyles.guideCard, { transform: [{ translateY: guideSlide }], opacity: guideOpacity }]}>
        <View style={[aStyles.stepBadge, { backgroundColor: Colors.ctaGreen }]}>
          <Text style={aStyles.stepNum}>3</Text>
        </View>
        <View style={aStyles.guideContent}>
          <Text style={[aStyles.cardTitle, { color: Colors.ctaGreen, marginBottom: 6 }]}>Your Next Steps</Text>
          {[
            { text: 'Track lender response', anim: step1Check },
            { text: 'Legal guidance & support', anim: step2Check },
            { text: 'Settlement negotiation', anim: step3Check },
          ].map((item, i) => (
            <Animated.View key={i} style={[aStyles.checkRow, { opacity: item.anim, transform: [{ translateX: item.anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <View style={aStyles.checkCircle}>
                <FontAwesome name="check" size={8} color={Colors.white} />
              </View>
              <Text style={aStyles.checkText}>{item.text}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Success banner */}
      <Animated.View style={[aStyles.successBanner, { transform: [{ scale: bannerScale }] }]}>
        <FontAwesome name="shield" size={16} color={Colors.white} />
        <Text style={aStyles.successText}>Complete legal support at every step</Text>
      </Animated.View>
    </View>
  );
}

const aStyles = StyleSheet.create({
  container: { width: width - 40, height: height * 0.38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', borderRadius: 24, overflow: 'hidden', paddingVertical: 12 },

  // Shared card style
  noticeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, width: '88%', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  replyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, width: '88%', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  guideCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, width: '88%', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },

  stepBadge: { position: 'absolute', top: -8, left: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.alert, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  stepNum: { fontSize: 10, fontWeight: '800', color: Colors.white },

  noticeIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  cardContent: { marginLeft: 8, flex: 1 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 9, color: Colors.textSecondary, marginTop: 1 },
  alertDot: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.alert, alignItems: 'center', justifyContent: 'center' },

  replyLines: { flexDirection: 'column', gap: 2, marginTop: 3 },
  line: { height: 3, backgroundColor: '#E5E7EB', borderRadius: 2 },
  stamp: { position: 'absolute', bottom: 4, right: 6, borderWidth: 1.5, borderColor: Colors.ctaGreen, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  stampText: { fontSize: 8, fontWeight: '900', color: Colors.ctaGreen, letterSpacing: 1.5 },
  sentBadge: { position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },

  guideContent: { marginLeft: 8, flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  checkCircle: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 10, fontWeight: '600', color: Colors.textPrimary },

  connector: { alignItems: 'center', height: 14, justifyContent: 'center' },
  connectorLine: { width: 1.5, height: 6, backgroundColor: Colors.primaryLight },

  successBanner: {
    position: 'absolute', bottom: 10, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  successText: { fontSize: 12, fontWeight: '700', color: Colors.white },
});

export default function Splash2() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

      <LegalAnimation />

      <Text style={styles.tagline}>
        We will <Text style={styles.highlight}>guide you on all legal notices</Text>
      </Text>

      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.cta} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/onboarding/splash3'); }} activeOpacity={0.8}>
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
  logo: { width: 180, height: 56, marginTop: 12, marginBottom: 12 },
  tagline: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginTop: 24, paddingHorizontal: 24, lineHeight: 34 },
  highlight: { color: Colors.primary },
  dots: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  dotActive: { width: 28, backgroundColor: Colors.primary, borderRadius: 5 },
  bottom: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingBottom: 16 },
  cta: { width: width - 40, paddingVertical: 17, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center', marginBottom: 8 },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 10 },
  skipText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
