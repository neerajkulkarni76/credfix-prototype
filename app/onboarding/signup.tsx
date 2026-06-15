import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, Keyboard, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const [phone, setPhoneLocal] = useState('');
  const setPhone = useOnboardingStore((s) => s.setPhone);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isValid = phone.replace(/\D/g, '').length === 10;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Fade out trust section, shrink top
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
        ]).start();
        // Scroll to input
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, [fadeAnim, scaleAnim]);

  const handleSignup = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    setPhone(phone.replace(/\D/g, ''));
    router.push('/onboarding/otp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Top section — brand */}
          <Animated.View style={[styles.topSection, { transform: [{ scale: scaleAnim }] }]}>
            <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>
              Take control of your{'\n'}
              <Text style={styles.headingHighlight}>financial future</Text>
            </Text>
            {!keyboardVisible && (
              <Text style={styles.subheading}>
                We help you resolve loans, handle legal notices, and manage recovery calls — all in one place.
              </Text>
            )}
          </Animated.View>

          {/* Trust strip — hide when keyboard open */}
          {!keyboardVisible && (
            <Animated.View style={[styles.trustStrip, { opacity: fadeAnim }]}>
              <View style={styles.trustChip}>
                <FontAwesome name="check-circle" size={12} color={Colors.ctaGreen} />
                <Text style={styles.trustChipText}>RBI Compliant</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustChip}>
                <FontAwesome name="check-circle" size={12} color={Colors.ctaGreen} />
                <Text style={styles.trustChipText}>Bank-grade Security</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustChip}>
                <FontAwesome name="check-circle" size={12} color={Colors.ctaGreen} />
                <Text style={styles.trustChipText}>24/7 Support</Text>
              </View>
            </Animated.View>
          )}

          {/* Spacer — pushes input to bottom when keyboard closed */}
          {!keyboardVisible && <View style={styles.spacer} />}

          {/* Input section */}
          <View style={styles.inputSection}>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Enter mobile number linked to PAN Card</Text>
              <View style={styles.phoneRow}>
                <View style={styles.prefixBox}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <View style={styles.divider} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter your number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => setPhoneLocal(t.replace(/[^0-9]/g, ''))}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
              </View>
            </View>

            <View style={styles.pill}>
              <View style={styles.greenDot} />
              <Text style={styles.pillText}>Safe space. Real help.</Text>
            </View>

            <TouchableOpacity
              style={[styles.cta, !isValid && styles.ctaDisabled]}
              onPress={handleSignup}
              disabled={!isValid}
              activeOpacity={0.8}
            >
              <Text style={[styles.ctaText, !isValid && styles.ctaTextDisabled]}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.tos}>
              By continuing, you agree to our{' '}
              <Text style={styles.tosLink}>Terms of Service</Text> and{' '}
              <Text style={styles.tosLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 20 },

  // Top
  topSection: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 32 },
  logo: { width: 180, height: 56, marginBottom: 24 },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 36 },
  headingHighlight: { color: Colors.primary },
  subheading: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 12, paddingHorizontal: 8 },

  // Trust
  trustStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, marginHorizontal: 20 },
  trustChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  trustChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  trustDivider: { width: 1, height: 14, backgroundColor: '#E5E7EB' },

  // Spacer
  spacer: { flex: 1, minHeight: 40 },

  // Input
  inputSection: { alignItems: 'center', paddingHorizontal: 20 },
  inputCard: { width: width - 40, backgroundColor: Colors.bgPage, borderRadius: 16, padding: 16, marginBottom: 14 },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border },
  prefixBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 6 },
  flagText: { fontSize: 18 },
  prefixText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  divider: { width: 1, height: 24, backgroundColor: Colors.border },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, fontWeight: '500', color: Colors.textPrimary },

  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 6, marginBottom: 16 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  pillText: { color: Colors.ctaGreenLight, fontSize: 13, fontWeight: '600' },

  cta: { width: width - 40, paddingVertical: 16, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center', marginBottom: 12 },
  ctaDisabled: { backgroundColor: '#E5E7EB' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  ctaTextDisabled: { color: '#9CA3AF' },

  tos: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 },
  tosLink: { color: Colors.primary, textDecorationLine: 'underline' },
});
