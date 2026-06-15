import React, { useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { userProfile, lenderEmails } from '@/data/mockData'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useNeytraStore } from '@/stores/neytraStore'
import { useGmailStore } from '@/stores/gmailStore'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

const TYPEWRITER_QUERIES = [
  'Help me settle my loan',
  'I got a legal notice',
  'Can I stop harassment calls?',
  'Recovery agent visited me',
  'What are my legal rights?',
  'Negotiate my EMI amount',
]

function TypewriterPlaceholder() {
  const [displayText, setDisplayText] = React.useState('')
  const stateRef = useRef({ queryIndex: 0, charIndex: 0, isDeleting: false, mounted: true })

  useEffect(() => {
    stateRef.current.mounted = true
    const TYPE_SPEED = 93
    const DELETE_SPEED = 53
    const PAUSE_AFTER_TYPE = 1500
    const PAUSE_AFTER_DELETE = 300

    const tick = () => {
      if (!stateRef.current.mounted) return
      const st = stateRef.current
      const currentQuery = TYPEWRITER_QUERIES[st.queryIndex]

      if (!st.isDeleting) {
        // Typing
        st.charIndex++
        setDisplayText(currentQuery.substring(0, st.charIndex))
        if (st.charIndex >= currentQuery.length) {
          st.isDeleting = true
          setTimeout(tick, PAUSE_AFTER_TYPE)
        } else {
          setTimeout(tick, TYPE_SPEED)
        }
      } else {
        // Deleting
        st.charIndex--
        setDisplayText(currentQuery.substring(0, st.charIndex))
        if (st.charIndex <= 0) {
          st.isDeleting = false
          st.queryIndex = (st.queryIndex + 1) % TYPEWRITER_QUERIES.length
          setTimeout(tick, PAUSE_AFTER_DELETE)
        } else {
          setTimeout(tick, DELETE_SPEED)
        }
      }
    }

    const timer = setTimeout(tick, 800)
    return () => { stateRef.current.mounted = false; clearTimeout(timer) }
  }, [])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 14, color: '#5B4FCC' }}>
        {displayText}
        <Text style={{ color: '#4A3AFF' }}>|</Text>
      </Text>
    </View>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen() {
  const router = useRouter()
  const greeting = getGreeting()
  const { firstName: enteredFirst, lastName: enteredLast } = useOnboardingStore()
  const neytraActivated = useNeytraStore((s) => s.activated)
  const gmailActivated = useGmailStore((s) => s.activated)
  const firstName = enteredFirst || userProfile.firstName

  // One-time ring highlight animation for email icon
  const showRing = !gmailActivated || lenderEmails.some((e) => e.unread)
  const ringRotate = useRef(new Animated.Value(0)).current
  const ringOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!showRing) return
    // Fade in, sweep 360°, then fade out
    const timer = setTimeout(() => {
      ringOpacity.setValue(1)
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start()
      })
    }, 800)
    return () => clearTimeout(timer)
  }, [showRing])

  const ringRotation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.name}>Hi {firstName},</Text>
            <Text style={s.greeting}>We're here to help you</Text>
          </View>
          <View style={s.headerIconWrap}>
            {showRing && (
              <Animated.View
                style={[
                  s.ringHighlight,
                  { opacity: ringOpacity, transform: [{ rotate: ringRotation }] },
                ]}
              />
            )}
            <TouchableOpacity
              style={[s.headerIcon, !gmailActivated && s.headerIconHighlight]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/gmail-screens'); }}
              activeOpacity={0.7}
            >
              <FontAwesome name="envelope-o" size={20} color={gmailActivated ? Colors.textSecondary : Colors.primary} />
              {gmailActivated ? (
                <View style={s.notifBadge}>
                  <Text style={s.notifBadgeText}>4</Text>
                </View>
              ) : (
                <View style={s.activateDot} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Risi Card — premium indigo ── */}
        <View style={s.risiCardOuter}>
          <View style={s.risiCard}>
            {/* Decorative gradient layers */}
            <View style={s.risiGradientTop} />
            <View style={s.risiGradientOrb} />

            {/* Header row */}
            <View style={s.risiTop}>
              <View style={s.risiRow}>
                <View style={s.risiLogoWrap}>
                  <Image source={require('@/assets/risi-nav.png')} style={s.risiLogo} resizeMode="contain" />
                </View>
                <View>
                  <Text style={s.risiLabel}>Risi</Text>
                  <Text style={s.risiSubLabel}>Here to help <FontAwesome name="heart-o" size={10} color="#8B7FCC" /></Text>
                </View>
              </View>
              <View style={s.risiStatusPill}>
                <View style={s.risiStatusDot} />
                <Text style={s.risiStatusText}>Online</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={s.risiDivider} />

            {/* Animated search input */}
            <TouchableOpacity
              style={s.risiInput}
              activeOpacity={0.8}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/chat/new'); }}
            >
              <TypewriterPlaceholder />
              <View style={s.risiEditBtn}>
                <FontAwesome name="pencil" size={13} color="#A89ED4" />
              </View>
              <View style={s.risiMicBtn}>
                <FontAwesome name="microphone" size={15} color={Colors.white} />
              </View>
            </TouchableOpacity>

            {/* Bottom tag line */}
            <View style={s.risiFooterRow}>
              <FontAwesome name="lock" size={9} color="rgba(74,58,255,0.3)" />
              <Text style={s.risiFooterText}>Private & encrypted</Text>
              <View style={s.risiFooterDot} />
              <Text style={s.risiFooterText}>Powered by AI</Text>
            </View>
          </View>
        </View>

        {/* ── Widgets row ── */}
        <View style={s.widgetRow}>
          {/* FD Balance */}
          <TouchableOpacity
            style={s.widgetLeft}
            activeOpacity={0.8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/savings-screens'); }}
          >
            <Text style={s.widgetSmallLabel}>FD BALANCE</Text>
            <Text style={s.widgetBigValue}>₹8,400</Text>
            <Text style={s.widgetSubValue}>of ₹50,000 goal</Text>
            <TouchableOpacity style={s.widgetBtn} activeOpacity={0.7}>
              <Text style={s.widgetBtnText}>+ Deposit More</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Neytra */}
          <TouchableOpacity
            style={s.widgetRight}
            activeOpacity={0.8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/neytra'); }}
          >
            <View style={s.neytraHeader}>
              <Image source={require('@/assets/neytra-logo-v2.png')} style={s.neytraIcon} resizeMode="contain" />
              <Text style={s.neytraLabel}>NEYTRA</Text>
              <FontAwesome name="chevron-right" size={10} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
            </View>
            {neytraActivated ? (
              <>
                <Text style={s.neytraBigValue}>12 Calls</Text>
                <Text style={s.neytraSubValue}>Handled today</Text>
                <View style={s.neytraLive}>
                  <View style={s.neytraLiveDot} />
                  <Text style={s.neytraLiveText}>LIVE NOW</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={[s.neytraBigValue, { fontSize: 18 }]}>AI Protection</Text>
                <Text style={s.neytraSubValue}>For recovery calls</Text>
                <View style={[s.neytraLive, { backgroundColor: Colors.primary }]}>
                  <Text style={[s.neytraLiveText, { color: Colors.white }]}>ACTIVATE</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Needs Attention ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Needs Attention</Text>
          <TouchableOpacity onPress={() => router.push('/chat/risi-hub')} activeOpacity={0.6}>
            <Text style={s.seeAll}>View all threads</Text>
          </TouchableOpacity>
        </View>

        {/* Bajaj Finance — conversational card */}
        <TouchableOpacity
          style={s.actionCard}
          activeOpacity={0.85}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/chat/settlement'); }}
        >
          <View style={s.actionHeader}>
            <View style={s.actionLogoRow}>
              <View style={s.actionLogo}>
                <FontAwesome name="circle" size={16} color={Colors.textPrimary} />
              </View>
              <View>
                <Text style={s.actionBankName}>Bajaj Finance</Text>
                <Text style={s.actionBankSub}>Settlement ready to approve</Text>
              </View>
            </View>
            <View style={s.savePill}>
              <Text style={s.savePillText}>Save ₹22,000</Text>
            </View>
          </View>

          <View style={s.actionBody}>
            <Text style={s.actionBodyText}>
              I got them down to <Text style={s.bold}>₹28,000</Text> from ₹50,000.{'\n'}Approve it and I'll lock the deal in writing.
            </Text>
          </View>

          <View style={s.actionCta}>
            <Text style={s.actionCtaText}>Review & Approve</Text>
            <View style={s.actionCtaArrow}>
              <FontAwesome name="arrow-right" size={11} color={Colors.white} />
            </View>
          </View>
        </TouchableOpacity>

        {/* HDFC — compact */}
        <TouchableOpacity
          style={s.compactCard}
          activeOpacity={0.85}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/chat/legal'); }}
        >
          <View style={s.compactLeft}>
            <View style={s.actionLogo}>
              <FontAwesome name="circle" size={16} color={Colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.compactBank}>HDFC</Text>
              <Text style={s.compactSub}>Legal notice — reply due</Text>
            </View>
          </View>
          <View style={s.deadlinePill}>
            <Text style={s.deadlinePillText}>4 days left</Text>
          </View>
        </TouchableOpacity>

        {/* ── Credit Score — empathetic ── */}
        <View style={[s.sectionRow, { marginTop: 20 }]}>
          <Text style={s.sectionTitle}>Your Progress</Text>
        </View>

        <TouchableOpacity
          style={s.creditCard}
          activeOpacity={0.85}
          onPress={() => router.push('/chat/risi-hub')}
        >
          <View style={s.creditTop}>
            <View style={s.creditScoreWrap}>
              <View style={s.scoreRingOuter}>
                <View style={s.scoreRingTrack} />
                <View style={s.scoreRingFill} />
                <View style={s.scoreRingInner}>
                  <Text style={s.scoreNum}>{userProfile.creditScore}</Text>
                  <Text style={s.scoreOf}>of 900</Text>
                </View>
              </View>
            </View>
            <View style={s.creditInfo}>
              <View style={s.creditSourceRow}>
                <Text style={s.scoreLabel}>Credit Score</Text>
                <Text style={s.scoreSource}>Experian</Text>
              </View>
              <Text style={s.creditMotivation}>You're building back stronger</Text>
              <View style={s.creditProgress}>
                <View style={s.creditProgressBar}>
                  <View style={s.creditProgressFill} />
                </View>
              </View>
            </View>
          </View>

          <View style={s.creditTip}>
            <View style={s.creditTipIcon}>
              <FontAwesome name="lightbulb-o" size={14} color="#D97706" />
            </View>
            <Text style={s.creditTipText}>
              Every step you take here improves your score. Keep going!
            </Text>
          </View>

          <View style={s.creditCta}>
            <Text style={s.creditCtaText}>See your improvement plan</Text>
            <View style={s.creditCtaArrow}>
              <FontAwesome name="arrow-right" size={11} color={Colors.white} />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <FontAwesome name="lock" size={10} color={Colors.textMuted} />
          <Text style={s.footerText}>256-bit encrypted · RBI compliant</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 20 },

  // ── Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 16, paddingBottom: 20 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  name: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  subGreeting: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  headerIconWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  ringHighlight: {
    position: 'absolute' as const, width: 52, height: 52, borderRadius: 26,
    borderWidth: 2.5, borderColor: 'transparent',
    borderTopColor: Colors.primary, borderRightColor: Colors.primary,
  },
  headerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', position: 'relative' as const },
  headerIconHighlight: { backgroundColor: '#F0EEFF', borderWidth: 1.5, borderColor: Colors.primaryLight },
  notifBadge: { position: 'absolute' as const, top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#DC2626', justifyContent: 'center' as const, alignItems: 'center' as const, borderWidth: 2, borderColor: '#FFFFFF' },
  notifBadgeText: { fontSize: 9, fontWeight: '800' as const, color: '#FFFFFF' },
  activateDot: { position: 'absolute' as const, top: -1, right: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#FFFFFF' },

  // ── Risi card — premium light indigo
  risiCardOuter: {
    marginBottom: 16, borderRadius: 24,
    shadowColor: '#4A3AFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  risiCard: {
    backgroundColor: '#F0EDFF', borderRadius: 24, padding: 20,
    overflow: 'hidden' as const,
    borderWidth: 1, borderColor: '#E0DBFF',
  },
  risiGradientTop: {
    position: 'absolute' as const, top: 0, left: 0, right: 0, height: 80,
    backgroundColor: '#E8E3FF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    opacity: 0.7,
  },
  risiGradientOrb: {
    position: 'absolute' as const, top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(74,58,255,0.06)',
  },
  risiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  risiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  risiLogoWrap: {
    width: 40, height: 40, borderRadius: 20, position: 'relative' as const,
    overflow: 'hidden' as const,
    shadowColor: '#4A3AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  risiLogo: { width: 40, height: 40, borderRadius: 20 },
  risiLabel: { fontSize: 26, fontFamily: 'Caveat_700Bold', color: '#4A3AFF', letterSpacing: 0.5 },
  risiSubLabel: { fontSize: 12, color: '#8B7FCC', marginTop: 1 },
  risiOnlineDot: {
    position: 'absolute' as const, bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: '#F0EDFF',
  },
  risiStatusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(74,58,255,0.06)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#E0DBFF',
  },
  risiStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  risiStatusText: { fontSize: 11, fontWeight: '600', color: '#8B7FCC' },
  risiDivider: {
    height: 1, backgroundColor: '#DDD8FF', marginBottom: 16,
    marginHorizontal: -20,
  },
  risiInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, paddingLeft: 16, paddingRight: 5, height: 50, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#DDD8FF',
    shadowColor: '#4A3AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  risiInputText: { flex: 1, fontSize: 14, color: '#9CA3AF' },
  risiEditBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  risiMicBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#4A3AFF', justifyContent: 'center', alignItems: 'center',
  },
  risiFooterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  risiFooterText: { fontSize: 10, color: '#A89ED4', fontWeight: '500' },
  risiFooterDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#C8BEE8' },

  // ── Widgets
  widgetRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  widgetLeft: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  widgetSmallLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  widgetBigValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  widgetSubValue: { fontSize: 12, color: Colors.textMuted, marginTop: 2, marginBottom: 12 },
  widgetBtn: {
    alignSelf: 'flex-start', borderWidth: 1.5, borderColor: Colors.ctaGreen,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  widgetBtnText: { fontSize: 12, fontWeight: '600', color: Colors.ctaGreen },
  widgetRight: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  neytraHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  neytraIcon: { width: 22, height: 22, borderRadius: 5 },
  neytraLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
  neytraBigValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  neytraSubValue: { fontSize: 12, color: Colors.textMuted, marginTop: 2, marginBottom: 10 },
  neytraLive: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  neytraLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  neytraLiveText: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.5 },

  // ── Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // ── Action card — conversational
  actionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#F0F0F5',
  },
  actionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  actionLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  actionBankName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  actionBankSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  savePill: { backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  savePillText: { fontSize: 11, fontWeight: '700', color: Colors.ctaGreen },
  actionBody: {
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: Colors.primaryLight,
  },
  actionBodyText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  bold: { fontWeight: '700', color: Colors.textPrimary },
  actionCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F0EDFF', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#DDD8FF',
  },
  actionCtaText: { fontSize: 14, fontWeight: '700', color: '#4A3AFF' },
  actionCtaArrow: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#4A3AFF',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Compact card
  compactCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#F0F0F5',
  },
  compactLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  compactBank: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  compactSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  deadlinePill: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  deadlinePillText: { fontSize: 11, fontWeight: '600', color: Colors.alert },

  // ── Credit — empathetic
  creditCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F0F0F5',
  },
  creditTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  creditScoreWrap: { alignItems: 'center' },
  scoreRingOuter: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreRingTrack: {
    position: 'absolute' as const, width: 64, height: 64, borderRadius: 32,
    borderWidth: 5, borderColor: '#F0EDFF',
  },
  scoreRingFill: {
    position: 'absolute' as const, width: 64, height: 64, borderRadius: 32,
    borderWidth: 5, borderColor: 'transparent',
    borderTopColor: '#4A3AFF', borderRightColor: '#4A3AFF', borderBottomColor: '#8B7FCC',
    transform: [{ rotate: '-45deg' }],
  },
  scoreRingInner: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },
  scoreNum: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, lineHeight: 20 },
  scoreOf: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
  creditInfo: { flex: 1 },
  creditSourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  scoreLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  scoreSource: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  creditMotivation: { fontSize: 13, color: '#4A3AFF', fontWeight: '600', marginBottom: 8 },
  creditProgress: { gap: 4 },
  creditProgressBar: {
    height: 6, backgroundColor: '#F0EDFF', borderRadius: 3, overflow: 'hidden' as const,
  },
  creditProgressFill: {
    width: '69%', height: 6, borderRadius: 3,
    backgroundColor: '#4A3AFF',
  },
  creditProgressText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  creditTip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: '#FEF3C7',
  },
  creditTipIcon: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#FEF3C7',
    justifyContent: 'center', alignItems: 'center',
  },
  creditTipText: { fontSize: 12, color: '#92400E', lineHeight: 18, flex: 1 },
  creditCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F0EDFF', borderRadius: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#DDD8FF',
  },
  creditCtaText: { fontSize: 14, fontWeight: '700', color: '#4A3AFF' },
  creditCtaArrow: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#4A3AFF',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4 },
  footerText: { fontSize: 11, color: Colors.textMuted },
})
