import React, { useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { recentCalls, neytraStats } from '@/data/mockData'
import * as Haptics from 'expo-haptics'

function AnimatedStat({ value, label }: { value: number; label: string }) {
  const anim = useRef(new Animated.Value(0)).current
  const displayVal = useRef(0)
  const [display, setDisplay] = React.useState('0')

  useEffect(() => {
    const listener = anim.addListener(({ value: v }) => {
      const rounded = Math.round(v)
      if (rounded !== displayVal.current) {
        displayVal.current = rounded
        setDisplay(String(rounded))
      }
    })
    Animated.timing(anim, {
      toValue: value, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start()
    return () => anim.removeListener(listener)
  }, [value])

  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{display}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function NeytraDashboardScreen() {
  const router = useRouter()

  const statusColor = (status: string) => {
    if (status === 'handled') return Colors.alert
    if (status === 'allowed') return Colors.success
    return Colors.alertOrange
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dark Header */}
        <View style={styles.darkHeader}>
          <View style={styles.headerTop}>
            <Image source={require('@/assets/neytra-logo-v2.png')} style={{ width: 80, height: 72 }} resizeMode="contain" />
            <View style={styles.headerTextWrap}>
              <Text style={styles.neytraTitle}>Neytra</Text>
              <Text style={styles.neytraSubtitle}>STAY PROTECTED</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/neytra-screens/history')} style={styles.historyBtn}>
              <FontAwesome name="history" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <AnimatedStat value={neytraStats.callsToday} label="Calls Today" />
            <AnimatedStat value={neytraStats.callsThisMonth} label="This Month" />
            <AnimatedStat value={neytraStats.hrsSaved} label="Hrs Saved" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Key Insight */}
          <Card style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <FontAwesome name="lightbulb-o" size={18} color={Colors.alertOrange} />
              <Text style={styles.insightBadge}>Key Insight</Text>
            </View>
            <Text style={styles.insightTitle}>Settlement offer from HDFC Bank</Text>
            <Text style={styles.insightDesc}>
              They want to close your {'\u20B9'}1L loan for {'\u20B9'}50,000. This could save you {'\u20B9'}50,000.
            </Text>
            <View style={styles.insightBtns}>
              <TouchableOpacity
                style={styles.greenBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/chat/settlement')}
              >
                <Text style={styles.greenBtnText}>See Next Step</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                activeOpacity={0.8}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/neytra-screens/insights'); }}
              >
                <Text style={styles.outlineBtnText}>View Call Insight</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Recent Calls */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Calls</Text>
            <TouchableOpacity onPress={() => router.push('/neytra-screens/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentCalls.map((call) => (
            <Card
              key={call.id}
              style={styles.callCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/neytra-screens/insights'); }}
            >
              <View style={styles.callRow}>
                <View style={[styles.phoneIcon, { backgroundColor: statusColor(call.status) + '18' }]}>
                  <FontAwesome
                    name={call.status === 'allowed' ? 'phone' : 'phone-square'}
                    size={16}
                    color={statusColor(call.status)}
                  />
                </View>
                <View style={styles.callInfo}>
                  <Text style={styles.callNumber}>{call.number}</Text>
                  <Text style={styles.callTime}>{call.time}</Text>
                </View>
                <View style={styles.callRight}>
                  {call.status === 'handled' && (
                    <View style={styles.handledBadge}>
                      <Text style={styles.handledText}>Handled by Neytra</Text>
                    </View>
                  )}
                  {call.bank && (
                    <View style={styles.bankTag}>
                      <Text style={styles.bankTagText}>{call.bank}</Text>
                    </View>
                  )}
                  {call.status === 'allowed' && !call.bank && call.extra && (
                    <Text style={styles.extraText}>{call.extra}</Text>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPage },
  darkHeader: { backgroundColor: Colors.neytraDark, paddingTop: 8, paddingBottom: 24, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  credFixIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  credFixText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  headerTextWrap: { flex: 1 },
  neytraTitle: { fontSize: 22, fontWeight: '700', color: Colors.white },
  neytraSubtitle: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, letterSpacing: 2 },
  historyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  content: { padding: 16, paddingBottom: 32 },
  insightCard: { marginBottom: 20, borderLeftWidth: 3, borderLeftColor: Colors.alertOrange },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightBadge: { fontSize: 12, fontWeight: '600', color: Colors.alertOrange },
  insightTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  insightDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 14 },
  insightBtns: { flexDirection: 'row', gap: 10 },
  greenBtn: { flex: 1, backgroundColor: Colors.ctaGreen, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  greenBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  outlineBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  outlineBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  callCard: { marginBottom: 8 },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  callInfo: { flex: 1 },
  callNumber: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  callTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  callRight: { alignItems: 'flex-end', gap: 4 },
  handledBadge: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  handledText: { fontSize: 10, fontWeight: '600', color: Colors.alert },
  bankTag: { backgroundColor: Colors.chipBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  bankTagText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  extraText: { fontSize: 11, color: Colors.textMuted },
})
