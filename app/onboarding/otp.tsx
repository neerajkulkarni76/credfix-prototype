import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform, ScrollView, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function OtpScreen() {
  const router = useRouter();
  const phone = useOnboardingStore((s) => s.phone);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(28);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (otp.every((d) => d.length === 1)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      const timeout = setTimeout(() => router.push('/onboarding/profile'), 500);
      return () => clearTimeout(timeout);
    }
  }, [otp]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    if (digit) Haptics.selectionAsync();
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 3) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const allFilled = otp.every((d) => d.length === 1);
  const maskedPhone = phone ? `+91 ${phone.slice(0, 2)}****${phone.slice(6)}` : '+91 ********';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            We sent a 4-digit OTP to{'\n'}
            <Text style={styles.phone}>{maskedPhone}</Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                maxLength={1}
                keyboardType="number-pad"
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                autoFocus={i === 0}
              />
            ))}
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.resendText}>Resend OTP in <Text style={styles.timerText}>{timer}s</Text></Text>
            ) : (
              <TouchableOpacity onPress={() => setTimer(28)}>
                <Text style={[styles.resendText, { color: Colors.primary, fontWeight: '600' }]}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.cta, !allFilled && styles.ctaDisabled]}
            onPress={() => {
              if (allFilled) {
                Keyboard.dismiss();
                router.push('/onboarding/profile');
              }
            }}
            disabled={!allFilled}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaText, !allFilled && styles.ctaTextDisabled]}>Verify</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <FontAwesome name="lock" size={14} color={Colors.textMuted} />
            <Text style={styles.footerText}>Your data is encrypted and secure. We follow RBI guidelines.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  logo: { width: 180, height: 56, marginBottom: 36 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  phone: { fontWeight: '700', color: Colors.textPrimary },
  otpRow: { flexDirection: 'row', gap: 14, marginTop: 36 },
  otpBox: {
    width: 58, height: 58, borderWidth: 2, borderColor: Colors.border,
    borderRadius: 14, textAlign: 'center', fontSize: 22, fontWeight: '700',
    color: Colors.textPrimary, backgroundColor: '#FAFAFA',
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  resendRow: { marginTop: 24 },
  resendText: { fontSize: 14, color: Colors.textSecondary },
  timerText: { fontWeight: '700', color: Colors.primary },
  spacer: { flex: 1, minHeight: 40 },
  cta: { width: width - 48, paddingVertical: 16, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center', marginBottom: 16 },
  ctaDisabled: { backgroundColor: '#E5E7EB' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  ctaTextDisabled: { color: '#9CA3AF' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: Colors.textMuted, flex: 1 },
});
