import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing, Image, Dimensions, Vibration,
} from 'react-native'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { recentCalls, neytraStats } from '@/data/mockData'
import { useNeytraStore } from '@/stores/neytraStore'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

// ── Animated count-up stat ──
function AnimatedStat({ value, label, icon, delay = 0 }: { value: number; label: string; icon: string; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [display, setDisplay] = React.useState('0')

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      ]).start()
      const listener = anim.addListener(({ value: v }) => setDisplay(String(Math.round(v))))
      Animated.timing(anim, { toValue: value, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start()
      return () => anim.removeListener(listener)
    }, delay)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.statIconWrap}>
        <FontAwesome name={icon as any} size={14} color={Colors.white} />
      </View>
      <Text style={styles.statValue}>{display}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  )
}

// ── Status config ──
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  handled: { color: '#DC2626', bg: '#FEF2F2', label: 'Handled by Neytra' },
  allowed: { color: '#16A34A', bg: '#F0FDF4', label: 'Allowed' },
  verify: { color: '#F97316', bg: '#FFF7ED', label: 'Verify' },
}

// ── Simulated incoming call component ──
function SimulatedCall({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'ringing' | 'answering' | 'talking' | 'done'>('ringing')
  const ringPulse = useRef(new Animated.Value(1)).current
  const cardSlide = useRef(new Animated.Value(60)).current
  const cardFade = useRef(new Animated.Value(0)).current
  const dotAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Card slides in
    Animated.parallel([
      Animated.spring(cardSlide, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start()

    // Haptic ring pattern
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 600)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 1200)

    // Phase: answering at 2.5s
    setTimeout(() => {
      setPhase('answering')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 2500)

    // Phase: talking at 4s
    setTimeout(() => {
      setPhase('talking')
      // Animate dots
      dotAnims.forEach((d, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 200),
            Animated.timing(d, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        ).start()
      })
    }, 4000)

    // Phase: done at 7s
    setTimeout(() => {
      setPhase('done')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setTimeout(onComplete, 1500)
    }, 7000)
  }, [])

  return (
    <Animated.View style={[simStyles.card, { transform: [{ translateY: cardSlide }], opacity: cardFade }]}>
      {phase === 'ringing' && (
        <View style={simStyles.content}>
          <Animated.View style={[simStyles.ringIcon, { transform: [{ scale: ringPulse }] }]}>
            <FontAwesome name="phone" size={20} color={Colors.alert} />
          </Animated.View>
          <View style={simStyles.textWrap}>
            <Text style={simStyles.title}>Incoming Call</Text>
            <Text style={simStyles.number}>+91 98XX XXX 431</Text>
            <Text style={simStyles.subtext}>Unknown number · Potential recovery call</Text>
          </View>
          <View style={simStyles.neytraBadge}>
            <Text style={simStyles.neytraBadgeText}>Neytra answering...</Text>
          </View>
        </View>
      )}

      {phase === 'answering' && (
        <View style={simStyles.content}>
          <View style={[simStyles.ringIcon, { backgroundColor: '#F0FDF4' }]}>
            <FontAwesome name="shield" size={20} color={Colors.ctaGreen} />
          </View>
          <View style={simStyles.textWrap}>
            <Text style={simStyles.title}>Neytra Answered</Text>
            <Text style={simStyles.number}>+91 98XX XXX 431</Text>
            <Text style={[simStyles.subtext, { color: Colors.ctaGreen }]}>Handling the call for you</Text>
          </View>
        </View>
      )}

      {phase === 'talking' && (
        <View style={simStyles.content}>
          <View style={[simStyles.ringIcon, { backgroundColor: '#EEF2FF' }]}>
            <FontAwesome name="comments" size={18} color={Colors.primary} />
          </View>
          <View style={simStyles.textWrap}>
            <Text style={simStyles.title}>Call in progress</Text>
            <Text style={simStyles.number}>+91 98XX XXX 431</Text>
            <View style={simStyles.dotsRow}>
              {dotAnims.map((d, i) => (
                <Animated.View key={i} style={[simStyles.dot, { opacity: d }]} />
              ))}
              <Text style={simStyles.listeningText}> Listening & recording</Text>
            </View>
          </View>
        </View>
      )}

      {phase === 'done' && (
        <View style={simStyles.content}>
          <View style={[simStyles.ringIcon, { backgroundColor: '#F0FDF4' }]}>
            <FontAwesome name="check-circle" size={22} color={Colors.ctaGreen} />
          </View>
          <View style={simStyles.textWrap}>
            <Text style={[simStyles.title, { color: Colors.ctaGreen }]}>Call Handled ✓</Text>
            <Text style={simStyles.number}>+91 98XX XXX 431</Text>
            <Text style={simStyles.subtext}>Summary and recording ready for you</Text>
          </View>
        </View>
      )}
    </Animated.View>
  )
}

const simStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ringIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  number: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  subtext: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  neytraBadge: { position: 'absolute', top: -8, right: -4, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  neytraBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.white },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 3 },
  listeningText: { fontSize: 11, color: Colors.primary, fontWeight: '500' },
})

// ── Main Screen ──
export default function NeytraTabScreen() {
  const router = useRouter()
  const { activated, firstVisitDone, setFirstVisitDone, setActivated } = useNeytraStore()

  // Always redirect to activation if Neytra is not activated
  useEffect(() => {
    if (!activated) {
      router.replace('/neytra-screens/activate')
    }
  }, [activated])

  const isFirstTime = activated && !firstVisitDone
  const [showSimCall, setShowSimCall] = useState(false)
  const [simCallDone, setSimCallDone] = useState(false)
  const headerFade = useRef(new Animated.Value(0)).current
  const contentFade = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const welcomeFade = useRef(new Animated.Value(0)).current

  // Determine which calls to show
  const displayCalls = isFirstTime
    ? simCallDone
      ? [{ id: 999, number: '+91 98XX XXX 431', status: 'handled' as const, bank: 'Unknown', time: 'Just now', date: 'Today', extra: undefined }]
      : []
    : recentCalls

  const displayStats = isFirstTime
    ? { callsToday: simCallDone ? 1 : 0, callsThisMonth: simCallDone ? 1 : 0, hrsSaved: 0 }
    : neytraStats

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start()
    setTimeout(() => Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }).start(), 300)
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start()

    // First time: show welcome, then simulate call after 3s
    if (isFirstTime) {
      Animated.timing(welcomeFade, { toValue: 1, duration: 500, useNativeDriver: true }).start()
      setTimeout(() => {
        setShowSimCall(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      }, 3000)
    }
  }, [])

  const handleSimCallComplete = useCallback(() => {
    setSimCallDone(true)
    setFirstVisitDone()
  }, [])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Dark header ── */}
      <Animated.View style={[styles.darkHeader, { opacity: headerFade }]}>
        <View style={styles.headerRow}>
          <Image source={require('@/assets/neytra-logo-v2.png')} style={styles.neytraLogo} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.neytraTitle}>Neytra</Text>
            <Animated.View style={[styles.protectionBadge, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.protectionDot} />
              <Text style={styles.protectionText}>Protection Active</Text>
            </Animated.View>
          </View>
          {!isFirstTime && (
            <TouchableOpacity onPress={() => router.push('/neytra-screens/history')} style={styles.iconBtn}>
              <FontAwesome name="list-ul" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          <AnimatedStat value={displayStats.callsToday} label="Today" icon="phone" delay={200} />
          <AnimatedStat value={displayStats.callsThisMonth} label="This Month" icon="calendar" delay={400} />
          <AnimatedStat value={displayStats.hrsSaved} label="Hrs Saved" icon="clock-o" delay={600} />
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <Animated.View style={[styles.content, { opacity: contentFade }]}>

        {/* First time welcome message */}
        {isFirstTime && !simCallDone && (
          <Animated.View style={[styles.welcomeCard, { opacity: welcomeFade }]}>
            <View style={styles.welcomeIcon}>
              <FontAwesome name="check-circle" size={22} color={Colors.ctaGreen} />
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Neytra is now protecting you</Text>
              <Text style={styles.welcomeDesc}>
                {showSimCall
                  ? 'We just detected a call coming in...'
                  : 'All recovery calls will now be handled automatically. Your contacts will always ring through.'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Simulated incoming call — first time only */}
        {isFirstTime && showSimCall && !simCallDone && (
          <SimulatedCall onComplete={handleSimCallComplete} />
        )}

        {/* Summary card — after sim call or for returning users */}
        {(!isFirstTime || simCallDone) && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <FontAwesome name="shield" size={18} color={Colors.ctaGreen} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>
                {simCallDone ? 'Your first call was handled!' : "Today's Summary"}
              </Text>
              <Text style={styles.summaryDesc}>
                {simCallDone
                  ? 'Neytra answered the call, recorded it, and prepared a summary for you.'
                  : `${neytraStats.callsToday} calls handled · No harassment detected · 1 settlement offer found`}
              </Text>
            </View>
          </View>
        )}

        {/* Insight card — only for returning users or after sim */}
        {(!isFirstTime || simCallDone) && (
          <View style={styles.insightCard}>
            <View style={styles.insightTopRow}>
              <View style={styles.insightIconWrap}>
                <FontAwesome name="lightbulb-o" size={16} color="#FBBF24" />
              </View>
              {!isFirstTime && (
                <View style={styles.insightBadgeWrap}>
                  <Text style={styles.insightBadgeText}>Action Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.insightTitle}>
              {simCallDone ? 'Call summary ready' : 'Settlement offer found'}
            </Text>
            <Text style={styles.insightDesc}>
              {simCallDone
                ? 'Neytra handled the call from +91 98XX XXX 431. Tap below to listen to the recording and see what was discussed.'
                : 'During a call today, a lender offered to close your ₹1L loan for ₹50,000. This could save you ₹50,000.'}
            </Text>
            <View style={styles.insightActions}>
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/neytra-screens/insights'); }}>
                <FontAwesome name={simCallDone ? 'play-circle' : 'arrow-right'} size={14} color={Colors.white} />
                <Text style={styles.primaryBtnText}>{simCallDone ? 'Listen to Call' : 'Review Offer'}</Text>
              </TouchableOpacity>
              {!simCallDone && (
                <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/neytra-screens/insights'); }}>
                  <FontAwesome name="play-circle" size={14} color={Colors.primary} />
                  <Text style={styles.secondaryBtnText}>Listen to Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Recent Calls — only if there are calls */}
        {displayCalls.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{simCallDone && isFirstTime ? 'Call Log' : 'Recent Calls'}</Text>
              {!isFirstTime && (
                <TouchableOpacity onPress={() => router.push('/neytra-screens/history')}>
                  <Text style={styles.seeAll}>View All →</Text>
                </TouchableOpacity>
              )}
            </View>

            {displayCalls.map((call) => {
              const config = statusConfig[call.status] || statusConfig.verify
              return (
                <TouchableOpacity key={call.id} style={styles.callCard} activeOpacity={0.7}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/neytra-screens/insights'); }}>
                  <View style={[styles.callBar, { backgroundColor: config.color }]} />
                  <View style={styles.callContent}>
                    <View style={styles.callTopRow}>
                      <View style={styles.callLeft}>
                        <View style={[styles.callIcon, { backgroundColor: config.bg }]}>
                          <FontAwesome name="phone" size={14} color={config.color} />
                        </View>
                        <View>
                          <Text style={styles.callNumber}>{call.number}</Text>
                          <Text style={styles.callTime}>{call.date} · {call.time}</Text>
                        </View>
                      </View>
                      <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
                    </View>
                    <View style={styles.callBottomRow}>
                      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </>
        )}

        {/* Empty state — before sim call */}
        {isFirstTime && !showSimCall && (
          <View style={styles.emptyState}>
            <FontAwesome name="phone" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No calls yet</Text>
            <Text style={styles.emptyDesc}>When a recovery call comes in, Neytra will handle it and show the details here.</Text>
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/neytra-screens/history'); }}>
            <View style={[styles.quickIcon, { backgroundColor: '#EEF2FF' }]}>
              <FontAwesome name="history" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.quickLabel}>Call History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/neytra-screens/insights'); }}>
            <View style={[styles.quickIcon, { backgroundColor: '#FFF7ED' }]}>
              <FontAwesome name="bar-chart" size={16} color={Colors.alertOrange} />
            </View>
            <Text style={styles.quickLabel}>Call Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[styles.quickIcon, { backgroundColor: '#F0FDF4' }]}>
              <FontAwesome name="user-plus" size={16} color={Colors.ctaGreen} />
            </View>
            <Text style={styles.quickLabel}>Whitelist</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  darkHeader: {
    backgroundColor: Colors.neytraDark, paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  neytraLogo: { width: 52, height: 47 },
  headerText: { flex: 1, marginLeft: 12 },
  neytraTitle: { fontSize: 24, fontWeight: '800', color: Colors.white },
  protectionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, alignSelf: 'flex-start', marginTop: 4,
  },
  protectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  protectionText: { fontSize: 11, fontWeight: '600', color: Colors.success },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },

  // Welcome
  welcomeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  welcomeIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  welcomeText: { flex: 1 },
  welcomeTitle: { fontSize: 15, fontWeight: '700', color: Colors.ctaGreen, marginBottom: 3 },
  welcomeDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Summary
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  summaryIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  summaryText: { flex: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: Colors.ctaGreen, marginBottom: 2 },
  summaryDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Insight
  insightCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  insightTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  insightIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  insightBadgeWrap: { backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  insightBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.alert },
  insightTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  insightDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 14 },
  insightActions: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1, flexDirection: 'row', gap: 6, backgroundColor: Colors.ctaGreen,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primaryLight, backgroundColor: '#FAFAFE',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // Call cards
  callCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  callBar: { width: 4, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  callContent: { flex: 1, padding: 14 },
  callTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  callLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  callIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  callNumber: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  callTime: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  callBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, marginTop: 12 },
  emptyDesc: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 6, paddingHorizontal: 32, lineHeight: 20 },

  // Quick actions
  quickActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  quickBtn: { flex: 1, alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  quickIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
})
