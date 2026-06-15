import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform, ScrollView, Keyboard, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [keyboardUp, setKeyboardUp] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  // Animated values for header shrink
  const logoHeight = useRef(new Animated.Value(56)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const headerMargin = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardUp(true);
        Animated.parallel([
          Animated.timing(logoHeight, { toValue: 0, duration: 200, useNativeDriver: false }),
          Animated.timing(logoOpacity, { toValue: 0, duration: 150, useNativeDriver: false }),
          Animated.timing(headerMargin, { toValue: 8, duration: 200, useNativeDriver: false }),
        ]).start();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardUp(false);
        Animated.parallel([
          Animated.timing(logoHeight, { toValue: 56, duration: 200, useNativeDriver: false }),
          Animated.timing(logoOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
          Animated.timing(headerMargin, { toValue: 32, duration: 200, useNativeDriver: false }),
        ]).start();
      }
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const isNameValid = (n: string) => n.trim().length >= 2;
  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const allValid = isNameValid(firstName) && isNameValid(lastName) && isEmailValid(email);

  const handleVerify = () => {
    if (!allValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    setProfile(firstName.trim(), lastName.trim(), email.trim());
    router.push('/onboarding/splash1');
  };

  // Scroll to a specific field when focused
  const scrollToField = (index: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: index * 80, animated: true });
    }, 150);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Logo — shrinks and fades when keyboard opens */}
          <Animated.View style={{ height: logoHeight, opacity: logoOpacity, overflow: 'hidden', alignItems: 'center' }}>
            <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={{ marginBottom: headerMargin }}>
            <Text style={styles.title}>Almost there</Text>
            {!keyboardUp && (
              <Text style={styles.subtitle}>
                We need this to safely check your loan{'\n'}details and help you resolve them
              </Text>
            )}
          </Animated.View>

          {/* Fields */}
          <View style={styles.fields}>
            {/* First Name */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>First Name (as per PAN card)*</Text>
              <View style={[styles.inputWrap, firstName.length > 0 && isNameValid(firstName) && styles.inputValid]}>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  onFocus={() => scrollToField(0)}
                  placeholder="Enter first name"
                  placeholderTextColor={Colors.textMuted}
                />
                {firstName.length > 0 && (
                  <View style={[styles.checkIcon, { backgroundColor: isNameValid(firstName) ? '#F0FDF4' : '#FEF2F2' }]}>
                    <FontAwesome name={isNameValid(firstName) ? 'check' : 'times'} size={12} color={isNameValid(firstName) ? Colors.success : Colors.alert} />
                  </View>
                )}
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Last Name (as per PAN card)*</Text>
              <View style={[styles.inputWrap, lastName.length > 0 && isNameValid(lastName) && styles.inputValid]}>
                <TextInput
                  ref={lastNameRef}
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  onFocus={() => scrollToField(1)}
                  placeholder="Enter last name"
                  placeholderTextColor={Colors.textMuted}
                />
                {lastName.length > 0 && (
                  <View style={[styles.checkIcon, { backgroundColor: isNameValid(lastName) ? '#F0FDF4' : '#FEF2F2' }]}>
                    <FontAwesome name={isNameValid(lastName) ? 'check' : 'times'} size={12} color={isNameValid(lastName) ? Colors.success : Colors.alert} />
                  </View>
                )}
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email Address*</Text>
              <View style={[styles.inputWrap, email.length > 0 && isEmailValid(email) && styles.inputValid]}>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                  onFocus={() => scrollToField(2)}
                  placeholder="Enter email address"
                  placeholderTextColor={Colors.textMuted}
                />
                {email.length > 0 && (
                  <View style={[styles.checkIcon, { backgroundColor: isEmailValid(email) ? '#F0FDF4' : '#FEF2F2' }]}>
                    <FontAwesome name={isEmailValid(email) ? 'check' : 'times'} size={12} color={isEmailValid(email) ? Colors.success : Colors.alert} />
                  </View>
                )}
              </View>
              {email.length > 0 && !email.includes('@') && (
                <Text style={styles.errorText}>Please enter a valid email</Text>
              )}
            </View>
          </View>

          {/* Security footer — only when keyboard is down */}
          {!keyboardUp && (
            <View style={styles.footer}>
              <FontAwesome name="lock" size={14} color={Colors.success} />
              <Text style={styles.footerText}>Your data is encrypted and secure. We follow RBI guidelines.</Text>
            </View>
          )}
        </ScrollView>

        {/* CTA pinned to bottom — always visible above keyboard */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.cta, !allValid && styles.ctaDisabled]}
            onPress={handleVerify}
            disabled={!allValid}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaText, !allValid && styles.ctaTextDisabled]}>Continue</Text>
            {allValid && <FontAwesome name="arrow-right" size={14} color={Colors.white} style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  logo: { width: 180, height: 56 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  fields: { width: '100%' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    backgroundColor: '#FAFAFA',
  },
  inputValid: { borderColor: '#BBF7D0' },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  checkIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  errorText: { fontSize: 12, color: Colors.alert, marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 16 },
  footerText: { fontSize: 12, color: Colors.textMuted, flex: 1, lineHeight: 17 },
  ctaContainer: {
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 16 : 24, paddingTop: 10,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  cta: {
    flexDirection: 'row', width: '100%', paddingVertical: 16, borderRadius: 28,
    backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#E5E7EB' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  ctaTextDisabled: { color: '#9CA3AF' },
});
