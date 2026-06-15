import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing, Alert, Image, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { lenderEmails, LenderEmail, EmailCategory } from '@/data/mockData'
import { useGmailStore } from '@/stores/gmailStore'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

const CATEGORY_COLORS: Record<EmailCategory, { bg: string; text: string }> = {
  'Collection Reminder': { bg: '#FEE2E2', text: '#DC2626' },
  'Repayment Reminder': { bg: '#FEF3C7', text: '#D97706' },
  'Legal Notice': { bg: '#FEE2E2', text: '#DC2626' },
  'NOC': { bg: '#D1FAE5', text: '#059669' },
  'Settlement Offer': { bg: '#EDE9FE', text: '#7C3AED' },
  'Closure Confirmation': { bg: '#D1FAE5', text: '#059669' },
}

const FILTERS: (EmailCategory | 'All')[] = [
  'All', 'Collection Reminder', 'Settlement Offer', 'Legal Notice', 'Repayment Reminder', 'NOC', 'Closure Confirmation',
]

function ActivateGmailView({ onActivate }: { onActivate: () => void }) {
  const shieldScale = useRef(new Animated.Value(0)).current
  const shieldPulse = useRef(new Animated.Value(1)).current
  const featureAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current
  const featureSlides = useRef([0, 1, 2, 3].map(() => new Animated.Value(20))).current
  const headerFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start()

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      Animated.spring(shieldScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start()
    }, 300)

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shieldPulse, { toValue: 1.06, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(shieldPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start()
    }, 800)

    ;[0, 1, 2, 3].forEach((i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(featureAnims[i], { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(featureSlides[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        ]).start()
      }, 600 + i * 120)
    })
  }, [])

  const features = [
    { icon: 'envelope', iconBg: '#FEE2E2', iconColor: '#EF4444', title: 'Auto-detect lender emails', desc: 'We scan your inbox and surface collection reminders, legal notices, settlement offers, and NOCs.' },
    { icon: 'tags', iconBg: '#EDE9FE', iconColor: '#7C3AED', title: 'Smart categorisation', desc: 'Every email is tagged by type and lender, so you see what matters at a glance.' },
    { icon: 'bolt', iconBg: '#FEF3C7', iconColor: '#D97706', title: 'Auto-create Risi threads', desc: 'Critical emails like legal notices and collection reminders auto-become Risi threads for immediate help.' },
    { icon: 'lock', iconBg: '#D1FAE5', iconColor: '#059669', title: 'Private & secure', desc: 'We only read loan-related emails. Personal emails are never accessed or stored.' },
  ]

  return (
    <ScrollView contentContainerStyle={styles.activateScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <Animated.View style={{ transform: [{ scale: Animated.multiply(shieldScale, shieldPulse) }] }}>
          <View style={styles.gmailIconWrap}>
            <FontAwesome name="envelope" size={36} color={Colors.primary} />
          </View>
        </Animated.View>
        <Text style={styles.heroTitle}>Connect your Gmail</Text>
        <Text style={styles.heroSubtitle}>Let Risi monitor your lender emails</Text>
        <Text style={styles.heroDesc}>
          We'll scan your inbox for collection reminders, legal notices, settlement offers, and more — so nothing slips through.
        </Text>
      </View>

      <View style={styles.activateCard}>
        <TouchableOpacity style={styles.gmailBtn} onPress={onActivate} activeOpacity={0.8}>
          <View style={styles.gmailBtnIcon}>
            <FontAwesome name="google" size={18} color="#EA4335" />
          </View>
          <Text style={styles.gmailBtnText}>Connect with Google</Text>
        </TouchableOpacity>
        <Text style={styles.gmailBtnSub}>Read-only access · Revoke anytime</Text>
      </View>

      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionTitle}>How it works</Text>
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

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

function EmailCard({ email, onPress }: { email: LenderEmail; onPress: () => void }) {
  const cat = CATEGORY_COLORS[email.category]
  return (
    <TouchableOpacity style={[styles.emailCard, email.unread && styles.emailCardUnread]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.emailTop}>
        <View style={styles.emailLenderRow}>
          <View style={styles.emailLenderDot}>
            <Text style={styles.emailLenderInitial}>{email.lender[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.emailLender, email.unread && styles.emailUnreadText]}>{email.lender}</Text>
            <Text style={styles.emailFrom}>{email.from}</Text>
          </View>
          <Text style={styles.emailTime}>{email.time}</Text>
        </View>
      </View>

      <Text style={[styles.emailSubject, email.unread && styles.emailUnreadText]} numberOfLines={1}>
        {email.subject}
      </Text>
      <Text style={styles.emailSnippet} numberOfLines={2}>{email.snippet}</Text>

      <View style={styles.emailFooter}>
        <View style={[styles.categoryPill, { backgroundColor: cat.bg }]}>
          <Text style={[styles.categoryPillText, { color: cat.text }]}>{email.category}</Text>
        </View>
        {email.critical && (
          <View style={styles.criticalBadge}>
            <FontAwesome name="exclamation-circle" size={10} color="#DC2626" />
            <Text style={styles.criticalText}>Critical</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {email.hasRisiThread ? (
          <View style={styles.risiThreadBadge}>
            <View style={styles.risiThreadDot} />
            <Text style={styles.risiThreadText}>Risi thread</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.startThreadBtn} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.startThreadText}>Ask Risi</Text>
            <FontAwesome name="arrow-right" size={10} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function GmailInboxScreen() {
  const router = useRouter()
  const { activated, setActivated } = useGmailStore()
  const [activeFilter, setActiveFilter] = useState<EmailCategory | 'All'>('All')

  const filteredEmails = activeFilter === 'All'
    ? lenderEmails
    : lenderEmails.filter((e) => e.category === activeFilter)

  const unreadCount = lenderEmails.filter((e) => e.unread).length
  const criticalCount = lenderEmails.filter((e) => e.critical && !e.hasRisiThread).length

  const handleActivate = () => {
    Alert.alert(
      'Allow Credfix to access Gmail?',
      'Credfix will only read loan-related emails from banks and lenders. Personal emails are never accessed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Allow',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            setActivated(true)
          },
        },
      ]
    )
  }

  const handleEmailPress = (email: LenderEmail) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({ pathname: '/gmail-screens/email-detail', params: { id: String(email.id) } } as any)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activated ? 'Lender Emails' : 'Connect Gmail'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!activated ? (
        <ActivateGmailView onActivate={handleActivate} />
      ) : (
        <>
          {/* Stats bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{lenderEmails.length}</Text>
              <Text style={styles.statLabel}>Emails found</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: '#DC2626' }]}>{criticalCount}</Text>
              <Text style={styles.statLabel}>Need action</Text>
            </View>
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
            {FILTERS.map((f) => {
              const isActive = f === activeFilter
              const count = f === 'All' ? lenderEmails.length : lenderEmails.filter((e) => e.category === f).length
              if (count === 0 && f !== 'All') return null
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => { Haptics.selectionAsync(); setActiveFilter(f) }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f === 'All' ? 'All' : f}
                  </Text>
                  <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                    <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>{count}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Email list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.emailList}>
            {filteredEmails.map((email) => (
              <EmailCard key={email.id} email={email} onPress={() => handleEmailPress(email)} />
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  // Activate view
  activateScroll: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 28 },
  gmailIconWrap: {
    width: 88, height: 88, borderRadius: 24, backgroundColor: '#F0EEFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginBottom: 10 },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 },

  activateCard: { alignItems: 'center', marginTop: 8 },
  gmailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    width: width - 40, paddingVertical: 16, borderRadius: 28,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  gmailBtnIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  gmailBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  gmailBtnSub: { fontSize: 12, color: Colors.textMuted, marginTop: 10 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  featureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Stats bar
  statsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginBottom: 14, backgroundColor: '#F9FAFB',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },

  // Filter
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 14, paddingTop: 2 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.white },
  filterCount: { backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  filterCountTextActive: { color: Colors.white },

  // Email list
  emailList: { paddingHorizontal: 20 },
  emailCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#F0F0F5',
  },
  emailCardUnread: { borderColor: '#E0DDFF', backgroundColor: '#FAFAFE' },
  emailTop: { marginBottom: 8 },
  emailLenderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emailLenderDot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  emailLenderInitial: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emailLender: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  emailFrom: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  emailTime: { fontSize: 11, color: Colors.textMuted },
  emailUnreadText: { fontWeight: '700' },
  emailSubject: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  emailSnippet: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 12 },

  // Footer tags
  emailFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  categoryPillText: { fontSize: 10, fontWeight: '700' },
  criticalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  criticalText: { fontSize: 10, fontWeight: '600', color: '#DC2626' },
  risiThreadBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F0EEFF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  risiThreadDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.primary },
  risiThreadText: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  startThreadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.primaryLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  startThreadText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
})
