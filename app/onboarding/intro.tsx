import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function IntroScreen() {
  const router = useRouter();

  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const bodyFade = useRef(new Animated.Value(0)).current;
  const bodySlide = useRef(new Animated.Value(15)).current;
  const item1 = useRef(new Animated.Value(0)).current;
  const item2 = useRef(new Animated.Value(0)).current;
  const item3 = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(titleSlide, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();
    }, 200);

    // Body text
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(bodyFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(bodySlide, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();
    }, 600);

    // Items stagger
    setTimeout(() => { Animated.timing(item1, { toValue: 1, duration: 350, useNativeDriver: true }).start(); }, 1000);
    setTimeout(() => { Animated.timing(item2, { toValue: 1, duration: 350, useNativeDriver: true }).start(); }, 1300);
    setTimeout(() => { Animated.timing(item3, { toValue: 1, duration: 350, useNativeDriver: true }).start(); }, 1600);

    // CTA
    setTimeout(() => {
      Animated.timing(ctaFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1900);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

        <View style={styles.content}>
          {/* Heading */}
          <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }] }}>
            <Text style={styles.title}>We need to understand{'\n'}your situation first</Text>
          </Animated.View>

          {/* Simple explanation */}
          <Animated.View style={{ opacity: bodyFade, transform: [{ translateY: bodySlide }] }}>
            <Text style={styles.body}>
              We'll ask you 3 simple questions so we can{'\n'}find the right solution for your loans.
            </Text>
          </Animated.View>

          {/* Reassurance */}
          <Animated.View style={[styles.reassurance, { opacity: ctaFade }]}>
            <FontAwesome name="clock-o" size={14} color={Colors.textMuted} />
            <Text style={styles.reassureText}>Takes less than 30 seconds</Text>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrap, { opacity: ctaFade }]}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/onboarding/q1');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Let's start</Text>
            <FontAwesome name="arrow-right" size={14} color={Colors.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 34 },
  logo: { width: 180, height: 56, marginBottom: 20 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },

  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 32, marginBottom: 12 },
  body: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 23, marginBottom: 32 },

  // List
  list: { width: '100%', gap: 16, marginBottom: 28 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  numberCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  listText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },

  // Reassurance
  reassurance: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reassureText: { fontSize: 13, color: Colors.textMuted },

  // CTA
  ctaWrap: { width: '100%' },
  cta: {
    flexDirection: 'row', paddingVertical: 16, borderRadius: 28,
    backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
