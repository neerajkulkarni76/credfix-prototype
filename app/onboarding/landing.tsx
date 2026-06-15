import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

type LandingType = 'neytra' | 'resolution' | 'legal';

const variants: Record<LandingType, {
  headerBg: string;
  title: string;
  subtitle: string;
  cardTitle: string;
  cardDesc: string;
  benefits: { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string }[];
  ctaLabel: string;
}> = {
  neytra: {
    headerBg: Colors.neytraDark,
    title: 'Meet Neytra',
    subtitle: 'Your AI-powered recovery call assistant',
    cardTitle: 'Smart Call Shield',
    cardDesc: 'Neytra listens to recovery calls, flags violations, and gives you real-time guidance.',
    benefits: [
      { icon: 'phone', text: 'Real-time call analysis' },
      { icon: 'shield', text: 'Harassment detection' },
      { icon: 'file-text', text: 'Auto-generated transcripts' },
      { icon: 'bell', text: 'Instant violation alerts' },
    ],
    ctaLabel: 'Activate Neytra',
  },
  resolution: {
    headerBg: Colors.ctaGreen,
    title: 'Debt Resolution',
    subtitle: 'A structured path to becoming debt-free',
    cardTitle: 'Smart Settlement Plans',
    cardDesc: 'We negotiate with lenders on your behalf and create affordable repayment plans.',
    benefits: [
      { icon: 'handshake-o', text: 'Expert negotiation support' },
      { icon: 'line-chart', text: 'Custom repayment plans' },
      { icon: 'rupee', text: 'Reduce total debt by up to 50%' },
      { icon: 'calendar-check-o', text: 'Track settlement progress' },
    ],
    ctaLabel: 'Start Resolution',
  },
  legal: {
    headerBg: Colors.primary,
    title: 'Legal Support',
    subtitle: 'Professional legal help when you need it most',
    cardTitle: 'Legal Shield',
    cardDesc: 'Upload notices, get expert legal analysis, and access affordable legal representation.',
    benefits: [
      { icon: 'gavel', text: 'Notice analysis & response' },
      { icon: 'balance-scale', text: 'Expert legal consultation' },
      { icon: 'file-text-o', text: 'Document preparation' },
      { icon: 'university', text: 'Court representation support' },
    ],
    ctaLabel: 'Upload Notice',
  },
};

export default function LandingScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const landing = variants[(type as LandingType) || 'neytra'] || variants.neytra;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: landing.headerBg }]}>
          <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />
          {type === 'neytra' && (
            <Image source={require('@/assets/neytra-logo-v2.png')} style={{ width: 64, height: 58, marginBottom: 12 }} resizeMode="contain" />
          )}
          <Text style={styles.headerTitle}>{landing.title}</Text>
          <Text style={styles.headerSub}>{landing.subtitle}</Text>
        </View>

        {/* Preview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{landing.cardTitle}</Text>
          <Text style={styles.cardDesc}>{landing.cardDesc}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsHeading}>What you get</Text>
          {landing.benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.iconWrap}>
                <FontAwesome name={b.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}
        >
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: landing.headerBg }]}
          onPress={() => {
            if (type === 'neytra') router.replace('/neytra-screens/activate');
            else if (type === 'legal') router.replace('/chat/legal');
            else router.replace('/chat/settlement');
          }} activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{landing.ctaLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 110 },
  header: { paddingTop: 20, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  logo: { width: 180, height: 56, marginBottom: 20, tintColor: Colors.white },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  card: { marginHorizontal: 24, marginTop: -16, backgroundColor: Colors.white, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  cardDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  benefitsSection: { paddingHorizontal: 24, marginTop: 28 },
  benefitsHeading: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  benefitText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500', flex: 1 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 34, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  homeBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  homeBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  actionBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
