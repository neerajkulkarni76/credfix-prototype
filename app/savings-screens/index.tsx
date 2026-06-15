import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Animated, Easing, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { fdList } from '@/data/mockData'
import { useFDStore } from '@/stores/fdStore'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')
const TABS = ['All', 'Active', 'Pending'] as const

/* ── Activation View ── */

function ActivateFDView({ onActivate }: { onActivate: () => void }) {
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
    { icon: 'inr', iconBg: '#D1FAE5', iconColor: '#059669', title: 'Start with as little as ₹1,000', desc: 'No minimum lock-in. Save at your own pace, whenever you can.' },
    { icon: 'line-chart', iconBg: '#EDE9FE', iconColor: '#7C3AED', title: 'Earn 7.5% interest p.a.', desc: 'Your savings grow while you plan your loan closures. Better than a savings account.' },
    { icon: 'shield', iconBg: '#FEF3C7', iconColor: '#D97706', title: 'Safe & RBI regulated', desc: 'Your FD is held with an RBI-regulated partner bank. Fully insured up to ₹5 lakhs.' },
    { icon: 'handshake-o', iconBg: '#F0EDFF', iconColor: '#4A3AFF', title: 'Save towards loan closure', desc: 'Accumulate funds and we negotiate settlement offers with your lenders in parallel.' },
  ]

  return (
    <ScrollView contentContainerStyle={styles.activateScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <Animated.View style={{ transform: [{ scale: Animated.multiply(shieldScale, shieldPulse) }] }}>
          <View style={styles.heroIconWrap}>
            <FontAwesome name="bank" size={32} color={Colors.primary} />
          </View>
        </Animated.View>
        <Text style={styles.heroTitle}>Start Saving on Credfix</Text>
        <Text style={styles.heroSubtitle}>Your path to becoming debt-free</Text>
        <Text style={styles.heroDesc}>
          Save small amounts every month. We'll help you accumulate enough to close your loans — and your money earns interest while it waits.
        </Text>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7.5%</Text>
          <Text style={styles.statLabel}>Interest p.a.</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹1,000</Text>
          <Text style={styles.statLabel}>Min deposit</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Lock-in</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.activateCta} onPress={onActivate} activeOpacity={0.8}>
        <Text style={styles.activateCtaText}>Book your first FD</Text>
        <FontAwesome name="arrow-right" size={14} color={Colors.white} />
      </TouchableOpacity>

      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionTitle}>Why save on Credfix?</Text>
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

/* ── Main Screen ── */

export default function FixedDepositsScreen() {
  const router = useRouter()
  const { bookNew } = useLocalSearchParams<{ bookNew?: string }>()
  const { activated, setActivated } = useFDStore()
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All')
  const [showModal, setShowModal] = useState(activated && bookNew === '1')
  const [fdAmount, setFdAmount] = useState('')

  const filteredFDs = activeTab === 'All'
    ? fdList
    : fdList.filter((fd) => fd.status === activeTab)

  const totalInvested = fdList.reduce((sum, fd) => sum + fd.amount, 0)
  const totalGains = 2800
  const totalSavings = totalInvested + totalGains

  const handleActivate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowModal(true)
  }

  const handleConfirmFD = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setActivated(true)
    setShowModal(false)
    setFdAmount('')
  }

  if (!activated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Savings</Text>
          <View style={{ width: 36 }} />
        </View>
        <ActivateFDView onActivate={handleActivate} />

        {/* Book FD Modal */}
        <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
            <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Book your first FD</Text>
              <Text style={styles.modalSubtitle}>Start small — every bit counts towards your loan closure</Text>
              <View style={styles.amountInputWrap}>
                <Text style={styles.rupeeSign}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={fdAmount}
                  onChangeText={setFdAmount}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.quickChips}>
                {[1000, 2000, 5000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickChip, fdAmount === String(amt) && styles.quickChipActive]}
                    onPress={() => setFdAmount(String(amt))}
                  >
                    <Text style={[styles.quickChipText, fdAmount === String(amt) && styles.quickChipTextActive]}>
                      ₹{amt.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.rateInfo}>
                <Text style={styles.rateLabel}>Interest Rate</Text>
                <Text style={styles.rateValue}>7.5% p.a.</Text>
              </View>
              <View style={styles.rateInfo}>
                <Text style={styles.rateLabel}>Tenure</Text>
                <Text style={styles.rateValue}>12 months</Text>
              </View>
              {fdAmount ? (
                <View style={styles.estimateBox}>
                  <Text style={styles.estimateLabel}>Estimated Returns</Text>
                  <Text style={styles.estimateValue}>
                    ₹{Math.round(Number(fdAmount) * 1.075).toLocaleString('en-IN')}
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.confirmBtn, !fdAmount && styles.confirmBtnDisabled]}
                activeOpacity={0.8}
                onPress={handleConfirmFD}
                disabled={!fdAmount}
              >
                <Text style={styles.confirmBtnText}>Confirm & Start Saving</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fixed Deposits</Text>
        <TouchableOpacity style={styles.bookBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Book New FD +</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Savings Summary */}
        <Card style={styles.savingsCard}>
          <Text style={styles.savingsLabel}>Total Savings</Text>
          <Text style={styles.savingsAmount}>₹{totalSavings.toLocaleString('en-IN')}</Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsItem}>
              <Text style={styles.savingsItemLabel}>Total Invested</Text>
              <Text style={styles.savingsItemValue}>₹{totalInvested.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.savingsDivider} />
            <View style={styles.savingsItem}>
              <Text style={styles.savingsItemLabel}>Gains</Text>
              <Text style={[styles.savingsItemValue, { color: Colors.success }]}>+₹{totalGains.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </Card>

        {/* Settlement prompt */}
        <Card style={styles.promptCard}>
          <View style={styles.promptRow}>
            <FontAwesome name="info-circle" size={16} color={Colors.primary} />
            <Text style={styles.promptText}>
              Save ₹15,500 more to settle your HDFC loan and become debt-free faster.
            </Text>
          </View>
        </Card>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FD List */}
        {filteredFDs.map((fd) => (
          <Card key={fd.id} style={styles.fdCard}>
            <View style={styles.fdTop}>
              <View>
                <Text style={styles.fdAmount}>₹{fd.amount.toLocaleString('en-IN')}</Text>
                <Text style={styles.fdDate}>{fd.date}</Text>
              </View>
              <Badge status={fd.status} />
            </View>
            <View style={styles.fdMeta}>
              <Text style={styles.fdRate}>{fd.interestRate}% p.a.</Text>
              <Text style={styles.fdDays}>{fd.daysRemaining} days remaining</Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Book New FD Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Book New FD</Text>
            <Text style={styles.modalSubtitle}>Enter amount to invest</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={fdAmount}
                onChangeText={setFdAmount}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.quickChips}>
              {[2000, 5000, 10000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickChip, fdAmount === String(amt) && styles.quickChipActive]}
                  onPress={() => setFdAmount(String(amt))}
                >
                  <Text style={[styles.quickChipText, fdAmount === String(amt) && styles.quickChipTextActive]}>
                    ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rateInfo}>
              <Text style={styles.rateLabel}>Interest Rate</Text>
              <Text style={styles.rateValue}>7.5% p.a.</Text>
            </View>
            <View style={styles.rateInfo}>
              <Text style={styles.rateLabel}>Tenure</Text>
              <Text style={styles.rateValue}>12 months</Text>
            </View>
            {fdAmount ? (
              <View style={styles.estimateBox}>
                <Text style={styles.estimateLabel}>Estimated Returns</Text>
                <Text style={styles.estimateValue}>
                  ₹{Math.round(Number(fdAmount) * 1.075).toLocaleString('en-IN')}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.confirmBtn, !fdAmount && styles.confirmBtnDisabled]}
              activeOpacity={0.8}
              onPress={() => { setShowModal(false); setFdAmount('') }}
              disabled={!fdAmount}
            >
              <Text style={styles.confirmBtnText}>Confirm FD</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPage },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bookBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },

  // Activate view
  activateScroll: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 24 },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#F0EDFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#DDD8FF',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginBottom: 10 },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, paddingHorizontal: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  activateCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16,
  },
  activateCtaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  featureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  featureIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Existing FD view
  scrollContent: { padding: 16, paddingBottom: 32 },
  savingsCard: { marginBottom: 12, backgroundColor: Colors.primaryLight },
  savingsLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  savingsAmount: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  savingsRow: { flexDirection: 'row', alignItems: 'center' },
  savingsItem: { flex: 1, alignItems: 'center' },
  savingsItemLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  savingsItemValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  savingsDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  promptCard: { marginBottom: 16, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  promptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  promptText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19, fontWeight: '500' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  fdCard: { marginBottom: 10 },
  fdTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  fdAmount: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  fdDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  fdMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fdRate: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  fdDays: { fontSize: 12, color: Colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  amountInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgPage, borderRadius: 14, paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  rupeeSign: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700', color: Colors.textPrimary, paddingVertical: 14 },
  quickChips: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickChip: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.chipBg, borderWidth: 1, borderColor: Colors.border },
  quickChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  quickChipText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  quickChipTextActive: { color: Colors.primary },
  rateInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rateLabel: { fontSize: 13, color: Colors.textSecondary },
  rateValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  estimateBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.savingsBg, borderRadius: 12, padding: 14, marginTop: 16,
  },
  estimateLabel: { fontSize: 13, fontWeight: '600', color: Colors.savingsText },
  estimateValue: { fontSize: 16, fontWeight: '700', color: Colors.savingsText },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
})
