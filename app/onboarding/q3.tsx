import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const incomeOptions = [
  'No income currently',
  'Below ₹25,000',
  '₹25,000 – ₹50,000',
  '₹50,000 – ₹75,000',
  '₹75,000 - 1.25 Lakh',
  '1.25 Lakh+',
];

export default function Q3Screen() {
  const router = useRouter();
  const { q1Answer, setQ3 } = useOnboardingStore();
  const [selected, setSelected] = useState('');

  // Animations
  const chipAnims = useRef(incomeOptions.map(() => new Animated.Value(0))).current;
  const chipSlides = useRef(incomeOptions.map(() => new Animated.Value(15))).current;
  const reassureFade = useRef(new Animated.Value(0)).current;
  const lockPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Chips stagger in
    incomeOptions.forEach((_, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(chipAnims[i], { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(chipSlides[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        ]).start();
      }, 200 + i * 80);
    });

    // Reassurance
    setTimeout(() => {
      Animated.timing(reassureFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    // Lock icon pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(lockPulse, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(lockPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Determine landing type from Q1 answer
  const getLandingType = () => {
    if (q1Answer.includes('calls') || q1Answer.includes('harassment')) return 'neytra';
    if (q1Answer.includes('legal') || q1Answer.includes('Legal')) return 'legal';
    return 'resolution';
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQ3(selected);
    router.push('/onboarding/analysis');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={styles.stepDotDone}>
            <FontAwesome name="check" size={7} color={Colors.white} />
          </View>
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={styles.stepDotDone}>
            <FontAwesome name="check" size={7} color={Colors.white} />
          </View>
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>

        {/* Heading */}
        <Text style={styles.title}>What's your monthly income?</Text>
        <Text style={styles.subtitle}>
          So we only suggest a plan you can actually{'\n'}afford — nothing more.
        </Text>

        {/* Options */}
        <View style={styles.chipsWrap}>
          {incomeOptions.map((opt, i) => (
            <Animated.View key={opt} style={{ opacity: chipAnims[i], transform: [{ translateY: chipSlides[i] }] }}>
              <TouchableOpacity
                style={[styles.chip, selected === opt && styles.chipSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(opt); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selected === opt && styles.chipTextSelected]}>{opt}</Text>
                {selected === opt && (
                  <View style={styles.chipCheck}>
                    <FontAwesome name="check" size={8} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Privacy reassurance */}
        <Animated.View style={[styles.privacyRow, { opacity: reassureFade }]}>
          <Animated.View style={{ transform: [{ scale: lockPulse }] }}>
            <FontAwesome name="lock" size={13} color={Colors.textMuted} />
          </Animated.View>
          <Text style={styles.privacyText}>This is private. We'll never share your info.</Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <FontAwesome name="arrow-left" size={12} color={Colors.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            onPress={handleContinue}
            disabled={!selected}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextText, !selected && styles.nextTextDisabled]}>See my plan</Text>
            {selected ? <FontAwesome name="arrow-right" size={12} color={Colors.white} style={{ marginLeft: 6 }} /> : null}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 110 },
  logo: { width: 180, height: 56, marginBottom: 20 },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: Colors.primary, width: 12, height: 12, borderRadius: 6 },
  stepDotDone: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 32, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: Colors.ctaGreen },

  // Heading
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 32, marginBottom: 6 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  // Chips — single column, full width
  chipsWrap: { width: '100%', gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: '#F3F4F6',
  },
  chipSelected: { backgroundColor: '#EEF2FF', borderColor: Colors.primary },
  chipText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  chipTextSelected: { color: Colors.primary, fontWeight: '600' },
  chipCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },

  // Privacy
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  privacyText: { fontSize: 12, color: Colors.textMuted },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 34, paddingTop: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  navRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    flex: 0.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 16, borderRadius: 28, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  backText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  nextBtn: { flex: 0.6, flexDirection: 'row', paddingVertical: 16, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  nextBtnDisabled: { backgroundColor: '#E5E7EB' },
  nextText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  nextTextDisabled: { color: '#9CA3AF' },
});
