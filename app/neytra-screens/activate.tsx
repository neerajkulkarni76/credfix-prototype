import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing,
  Switch, Platform, Alert, Dimensions, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { useNeytraStore } from '@/stores/neytraStore';

const { width } = Dimensions.get('window');

// Feature item data
const features = [
  {
    icon: 'phone',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    title: 'Manage unknown calls',
    desc: 'Neytra answers recovery & lender calls on your behalf so you don\'t have to.',
  },
  {
    icon: 'address-book',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'Your contacts ring through',
    desc: 'Calls from your phonebook and whitelisted numbers always reach you directly.',
  },
  {
    icon: 'file-audio-o',
    iconBg: '#EEF2FF',
    iconColor: '#4A3AFF',
    title: 'Call recording & summary',
    desc: 'Every managed call is recorded. You get an AI summary of what was discussed.',
  },
  {
    icon: 'shield',
    iconBg: '#FFF7ED',
    iconColor: '#F97316',
    title: 'Harassment detection',
    desc: 'Neytra monitors tone and language. If a caller crosses the line, we flag it with RBI guidelines.',
  },
  {
    icon: 'line-chart',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'Settlement opportunities',
    desc: 'If a lender offers a settlement during the call, Neytra captures it and alerts you instantly.',
  },
];

// Permission items
const permissions = [
  { icon: 'phone', label: 'Phone Calls', desc: 'Allow to make and manage phone calls', key: 'phone' },
  { icon: 'id-card', label: 'Default Caller ID App', desc: 'Set as default caller ID & spam app', key: 'mic' },
  { icon: 'address-book-o', label: 'Contacts', desc: 'To identify safe calls', key: 'contacts' },
];

export default function NeytraActivateScreen() {
  const router = useRouter();
  const [activated, setActivated] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const featureAnims = useRef(features.map(() => new Animated.Value(0))).current;
  const featureSlides = useRef(features.map(() => new Animated.Value(20))).current;
  const shieldScale = useRef(new Animated.Value(0)).current;
  const shieldPulse = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successFade = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Shield entrance
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(shieldScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
    }, 300);

    // Shield pulse
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shieldPulse, { toValue: 1.06, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(shieldPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }, 800);

    // Features stagger
    features.forEach((_, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(featureAnims[i], { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(featureSlides[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        ]).start();
      }, 600 + i * 120);
    });
  }, []);


  // Sequential permission flow — all 3 popups fire one after another on toggle
  const requestAllPermissions = (index: number) => {
    if (index >= permissions.length) {
      // All granted — activate
      setActivated(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
        Animated.timing(successFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      return;
    }

    const p = permissions[index];
    const titles = {
      phone: 'Allow CredFix to make and manage phone calls?',
      mic: 'Set CredFix as default Caller ID & spam app?',
      contacts: 'Allow CredFix to access your contacts?',
    };
    const descs = {
      phone: 'This allows Neytra to manage incoming recovery calls on your behalf.',
      mic: 'This allows Neytra to identify recovery callers and protect you from spam.',
      contacts: 'This allows Neytra to identify safe calls from your contacts and let them ring through.',
    };

    Alert.alert(
      titles[p.key as keyof typeof titles],
      descs[p.key as keyof typeof descs],
      [
        {
          text: 'Deny', style: 'cancel',
          onPress: () => {
            // Still continue to next permission
            setTimeout(() => requestAllPermissions(index + 1), 300);
          },
        },
        {
          text: 'Allow',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPermissionsGranted((prev) => ({ ...prev, [p.key]: true }));
            setTimeout(() => requestAllPermissions(index + 1), 300);
          },
        },
      ]
    );
  };

  const handleToggle = (value: boolean) => {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      requestAllPermissions(0);
    } else {
      setActivated(false);
    }
  };

  const setNeytraActivated = useNeytraStore((s) => s.setActivated);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setNeytraActivated(true);
    router.replace('/(tabs)/neytra');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activate Neytra</Text>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <Animated.View style={[styles.shieldWrap, { transform: [{ scale: Animated.multiply(shieldScale, shieldPulse) }] }]}>
            <Image source={require('@/assets/neytra-logo-v2.png')} style={{ width: 88, height: 88, borderRadius: 20 }} resizeMode="contain" />
          </Animated.View>

          <Text style={styles.heroTitle}>Meet Neytra</Text>
          <Text style={styles.heroSubtitle}>Your AI-powered call protection</Text>
          <Text style={styles.heroDesc}>
            Neytra answers recovery and lender calls for you, so you can have peace of mind.
          </Text>
        </View>

        {/* Activation toggle — above features */}
        <View style={styles.activateCard}>
          <View style={styles.activateRow}>
            <View style={styles.activateInfo}>
              <FontAwesome name="power-off" size={18} color={activated ? Colors.ctaGreen : Colors.textMuted} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.activateLabel}>Neytra Protection</Text>
                <Text style={styles.activateStatus}>
                  {activated ? 'Active — managing your calls' : 'Tap to enable protection'}
                </Text>
              </View>
            </View>
            <Switch
              value={activated}
              onValueChange={handleToggle}
              trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
              thumbColor={activated ? Colors.ctaGreen : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>How Neytra protects you</Text>
        </View>

        {features.map((f, i) => (
          <Animated.View key={i} style={[styles.featureCard, { opacity: featureAnims[i], transform: [{ translateY: featureSlides[i] }] }]}>
            <View style={[styles.featureIcon, { backgroundColor: f.iconBg }]}>
              <FontAwesome name={f.icon as any} size={18} color={f.iconColor} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Success state */}
        {showSuccess && (
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }], opacity: successFade }]}>
            <View style={styles.successIcon}>
              <FontAwesome name="check" size={20} color={Colors.white} />
            </View>
            <Text style={styles.successTitle}>Neytra is now active!</Text>
            <Text style={styles.successDesc}>
              All unknown and potential recovery calls will now be handled by Neytra. Calls from your contacts will always reach you directly.
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      {showSuccess && (
        <View style={styles.bottomCta}>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.ctaText}>Go to Neytra Dashboard</Text>
            <FontAwesome name="arrow-right" size={14} color={Colors.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPage, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  scroll: { paddingHorizontal: 20 },

  // Hero
  heroSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 28 },
  shieldWrap: { marginBottom: 20 },
  shieldOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(74, 58, 255, 0.08)', alignItems: 'center', justifyContent: 'center' },
  shieldInner: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  shieldCheck: { position: 'absolute', bottom: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginBottom: 10 },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  // Features
  featureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.bgPage, borderRadius: 14, padding: 14, marginBottom: 10,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Permissions
  permNote: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  permRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgPage, borderRadius: 14, padding: 14, marginBottom: 8,
  },
  permIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  permIconGranted: { backgroundColor: Colors.ctaGreen },
  permText: { flex: 1 },
  permLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  permDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  permGranted: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  permAllow: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Activate
  activateCard: {
    marginTop: 20, backgroundColor: Colors.bgPage, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  activateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activateInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  activateLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  activateStatus: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  // Success
  successCard: {
    marginTop: 20, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center',
  },
  successIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: '700', color: Colors.ctaGreen, marginBottom: 6 },
  successDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  successStats: { gap: 10, width: '100%' },
  successStat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  successStatText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  // Bottom CTA
  bottomCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  ctaBtn: {
    flexDirection: 'row', paddingVertical: 17, borderRadius: 28,
    backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
