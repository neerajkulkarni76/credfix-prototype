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

const options = [
  { label: 'Stop the calls & harassment', icon: 'phone-square', type: 'neytra' },
  { label: 'Need legal support', icon: 'balance-scale', type: 'legal' },
  { label: 'Settle or reduce a loan', icon: 'handshake-o', type: 'resolution' },
];

export default function Q1Screen() {
  const router = useRouter();
  const { setQ1, setQ3 } = useOnboardingStore();
  const [selected, setSelected] = useState('');

  // Stagger animations
  const fadeAnims = useRef(options.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(options.map(() => new Animated.Value(20))).current;
  const footerFade = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    options.forEach((_, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnims[i], { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(slideAnims[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        ]).start();
      }, 300 + i * 120);
    });

    // Footer fade in
    setTimeout(() => {
      Animated.timing(footerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    // Heart pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(heartPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQ1(selected);
    // Also store in q3 since this determines the landing route
    const match = options.find((o) => o.label === selected);
    if (match) setQ3(selected);
    router.push('/onboarding/q2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>

        {/* Empathetic heading */}
        <Text style={styles.title}>What would help you{'\n'}most right now?</Text>
        <Text style={styles.subtitle}>
          There's no wrong answer. It just helps us{'\n'}start in the right place.
        </Text>

        {/* Options — larger, with icons */}
        <View style={styles.optionsWrap}>
          {options.map((opt, i) => (
            <Animated.View key={opt.label} style={{ opacity: fadeAnims[i], transform: [{ translateY: slideAnims[i] }] }}>
              <TouchableOpacity
                style={[styles.optionCard, selected === opt.label && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(opt.label); }}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, selected === opt.label && styles.optionIconSelected]}>
                  <FontAwesome name={opt.icon as any} size={18} color={selected === opt.label ? Colors.white : Colors.primary} />
                </View>
                <Text style={[styles.optionText, selected === opt.label && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {selected === opt.label && (
                  <View style={styles.optionCheck}>
                    <FontAwesome name="check" size={10} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Footer reassurance */}
        <Animated.View style={[styles.footerMessage, { opacity: footerFade }]}>
          <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
            <FontAwesome name="heart" size={14} color={Colors.ctaGreenLight} />
          </Animated.View>
          <Text style={styles.footerText}>We will immediately help you with the solution</Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cta, !selected && styles.ctaDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctaText, !selected && styles.ctaTextDisabled]}>Continue</Text>
          {selected ? <FontAwesome name="arrow-right" size={14} color={Colors.white} style={{ marginLeft: 8 }} /> : null}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 110 },
  logo: { width: 180, height: 56, marginBottom: 20 },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: Colors.primary, width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 32, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },

  // Heading
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 32, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 },

  // Options
  optionsWrap: { width: '100%', gap: 12 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F3F4F6',
  },
  optionCardSelected: { backgroundColor: '#EEF2FF', borderColor: Colors.primary },
  optionIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  optionIconSelected: { backgroundColor: Colors.primary },
  optionText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  optionTextSelected: { color: Colors.primary },
  optionCheck: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // Footer
  footerMessage: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, paddingHorizontal: 12 },
  footerText: { fontSize: 13, color: Colors.ctaGreenLight, fontWeight: '500' },

  // Bottom CTA
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 34, paddingTop: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  cta: {
    flexDirection: 'row', paddingVertical: 16, borderRadius: 28,
    backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#E5E7EB' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  ctaTextDisabled: { color: '#9CA3AF' },
});
