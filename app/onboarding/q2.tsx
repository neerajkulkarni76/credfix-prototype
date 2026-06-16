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

const reasons = [
  'Medical emergency',
  'Job loss',
  'Personal Expenses',
  'Family responsibilities',
  'Business loss',
  'Others',
];

// Muted loan card data (highest DPD loan)
const highlightedLoan = {
  name: 'Personal Loan',
  bank: 'Bajaj Finserv',
  amount: '₹86,200',
  delay: 'Overdue 6 months',
};

export default function Q2Screen() {
  const router = useRouter();
  const setQ2 = useOnboardingStore((s) => s.setQ2);
  const [selected, setSelected] = useState('');

  // Animations
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(15)).current;
  const chipAnims = useRef(reasons.map(() => new Animated.Value(0))).current;
  const chipSlides = useRef(reasons.map(() => new Animated.Value(15))).current;
  const reassureFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loan card fades in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
      ]).start();
    }, 200);

    // Chips stagger in
    reasons.forEach((_, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(chipAnims[i], { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(chipSlides[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        ]).start();
      }, 500 + i * 80);
    });

    // Reassurance text
    setTimeout(() => {
      Animated.timing(reassureFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1000);
  }, []);

  const handleNext = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQ2(selected);
    router.navigate('/onboarding/q3');
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
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>

        {/* Muted loan card */}
        <Animated.View style={[styles.loanCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <Text style={styles.loanCardLabel}>As per the credit report, this loan has the highest delay</Text>
          <View style={styles.loanRow}>
            <View style={styles.loanIconWrap}>
              <FontAwesome name="bank" size={14} color={Colors.textSecondary} />
            </View>
            <View style={styles.loanInfo}>
              <Text style={styles.loanName}>{highlightedLoan.name}</Text>
              <Text style={styles.loanBank}>{highlightedLoan.bank}</Text>
            </View>
            <View style={styles.loanAmountWrap}>
              <Text style={styles.loanAmount}>{highlightedLoan.amount}</Text>
              <Text style={styles.loanDelay}>{highlightedLoan.delay}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Empathetic heading */}
        <Text style={styles.title}>What's the primary reason for{'\n'}the missed payment?</Text>

        <Animated.Text style={[styles.subtitle, { opacity: reassureFade }]}>
          This happens to a lot of people.{'\n'}Knowing helps us find the right fix.
        </Animated.Text>

        {/* Options */}
        <View style={styles.chipsWrap}>
          {reasons.map((opt, i) => (
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
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <FontAwesome name="arrow-left" size={12} color={Colors.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!selected}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextText, !selected && styles.nextTextDisabled]}>Continue</Text>
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
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: Colors.primary, width: 12, height: 12, borderRadius: 6 },
  stepDotDone: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 32, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: Colors.ctaGreen },

  // Loan card — muted, gentle
  loanCard: {
    width: '100%', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 22,
  },
  loanCardLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginBottom: 10, lineHeight: 17 },
  loanRow: { flexDirection: 'row', alignItems: 'center' },
  loanIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  loanInfo: { marginLeft: 10, flex: 1 },
  loanName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  loanBank: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  loanAmountWrap: { alignItems: 'flex-end' },
  loanAmount: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  loanDelay: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  // Heading
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 30, marginBottom: 6 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 22 },

  // Chips
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
