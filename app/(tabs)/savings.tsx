import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Animated, Easing, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useFDStore } from '@/stores/fdStore'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

/* ── Activation View ── */

function ActivateFDView({ onActivate }: { onActivate: () => void }) {
  const shieldScale = useRef(new Animated.Value(0)).current
  const shieldPulse = useRef(new Animated.Value(1)).current
  const featureAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current
  const featureSlides = useRef([0, 1, 2, 3].map(() => new Animated.Value(20))).current

  useEffect(() => {
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
    <ScrollView contentContainerStyle={st.activateScroll} showsVerticalScrollIndicator={false}>
      <View style={st.heroSection}>
        <Animated.View style={{ transform: [{ scale: Animated.multiply(shieldScale, shieldPulse) }] }}>
          <View style={st.heroIconWrap}>
            <FontAwesome name="bank" size={32} color={Colors.primary} />
          </View>
        </Animated.View>
        <Text style={st.heroTitle}>Start Saving on Credfix</Text>
        <Text style={st.heroSubtitle}>Your path to becoming debt-free</Text>
        <Text style={st.heroDesc}>
          Save small amounts every month. We'll help you accumulate enough to close your loans — and your money earns interest while it waits.
        </Text>
      </View>

      <View style={st.statsRow}>
        <View style={st.statCard}>
          <Text style={st.statValue}>7.5%</Text>
          <Text style={st.statLabel}>Interest p.a.</Text>
        </View>
        <View style={st.statCard}>
          <Text style={st.statValue}>₹1,000</Text>
          <Text style={st.statLabel}>Min deposit</Text>
        </View>
        <View style={st.statCard}>
          <Text style={st.statValue}>0</Text>
          <Text style={st.statLabel}>Lock-in</Text>
        </View>
      </View>

      <TouchableOpacity style={st.activateCta} onPress={onActivate} activeOpacity={0.8}>
        <Text style={st.activateCtaText}>Book your first FD</Text>
        <FontAwesome name="arrow-right" size={14} color={Colors.white} />
      </TouchableOpacity>

      <View style={[st.sectionHeader, { marginTop: 24 }]}>
        <View style={st.sectionDot} />
        <Text style={st.sectionTitleText}>Why save on Credfix?</Text>
      </View>

      {features.map((f, i) => (
        <Animated.View key={i} style={[st.featureCard, { opacity: featureAnims[i], transform: [{ translateY: featureSlides[i] }] }]}>
          <View style={[st.featureIcon, { backgroundColor: f.iconBg }]}>
            <FontAwesome name={f.icon as any} size={18} color={f.iconColor} />
          </View>
          <View style={st.featureText}>
            <Text style={st.featureTitle}>{f.title}</Text>
            <Text style={st.featureDesc}>{f.desc}</Text>
          </View>
        </Animated.View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

/* ── Main Tab Screen ── */

export default function SavingsTab() {
  const router = useRouter()
  const { activated, deposits, addDeposit } = useFDStore()
  const [showModal, setShowModal] = useState(false)
  const [fdAmount, setFdAmount] = useState('')

  const totalInvested = deposits.reduce((sum, fd) => sum + fd.amount, 0)
  const totalGains = Math.round(totalInvested * 0.075 * (30 / 365))
  const totalSavings = totalInvested + totalGains

  const handleActivate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowModal(true)
  }

  const handleConfirmFD = () => {
    if (!fdAmount) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addDeposit(Number(fdAmount))
    setShowModal(false)
    setFdAmount('')
  }

  const renderModal = (isFirstFD: boolean) => (
    <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
      <TouchableOpacity style={st.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
        <TouchableOpacity style={st.modalSheet} activeOpacity={1} onPress={() => {}}>
          <View style={st.modalHandle} />
          <Text style={st.modalTitle}>{isFirstFD ? 'Book your first FD' : 'Book New FD'}</Text>
          <Text style={st.modalSubtitle}>{isFirstFD ? 'Start small — every bit counts towards your loan closure' : 'Enter amount to invest'}</Text>
          <View style={st.amountInputWrap}>
            <Text style={st.rupeeSign}>₹</Text>
            <TextInput
              style={st.amountInput}
              value={fdAmount}
              onChangeText={setFdAmount}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={st.quickChips}>
            {(isFirstFD ? [1000, 2000, 5000] : [2000, 5000, 10000]).map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[st.quickChip, fdAmount === String(amt) && st.quickChipActive]}
                onPress={() => setFdAmount(String(amt))}
              >
                <Text style={[st.quickChipText, fdAmount === String(amt) && st.quickChipTextActive]}>
                  ₹{amt.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={st.rateInfo}>
            <Text style={st.rateLabel}>Interest Rate</Text>
            <Text style={st.rateValue}>7.5% p.a.</Text>
          </View>
          <View style={st.rateInfo}>
            <Text style={st.rateLabel}>Tenure</Text>
            <Text style={st.rateValue}>12 months</Text>
          </View>
          {fdAmount ? (
            <View style={st.estimateBox}>
              <Text style={st.estimateLabel}>Estimated Returns</Text>
              <Text style={st.estimateValue}>₹{Math.round(Number(fdAmount) * 1.075).toLocaleString('en-IN')}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={[st.confirmBtn, !fdAmount && st.confirmBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleConfirmFD}
            disabled={!fdAmount}
          >
            <Text style={st.confirmBtnText}>{isFirstFD ? 'Confirm & Start Saving' : 'Confirm FD'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )

  if (!activated) {
    return (
      <SafeAreaView style={st.safe} edges={['top']}>
        <View style={st.headerCenter}>
          <Text style={st.headerTitle}>Funds</Text>
        </View>
        <ActivateFDView onActivate={handleActivate} />
        {renderModal(true)}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <Text style={st.headerTitle}>Fixed Deposits</Text>
        <TouchableOpacity style={st.bookBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Text style={st.bookBtnText}>Book New FD +</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scrollContent}>
        <Card style={st.savingsCard}>
          <Text style={st.savingsLabel}>Total Savings</Text>
          <Text style={st.savingsAmount}>₹{totalSavings.toLocaleString('en-IN')}</Text>
          <View style={st.savingsRow}>
            <View style={st.savingsItem}>
              <Text style={st.savingsItemLabel}>Total Invested</Text>
              <Text style={st.savingsItemValue}>₹{totalInvested.toLocaleString('en-IN')}</Text>
            </View>
            <View style={st.savingsDivider} />
            <View style={st.savingsItem}>
              <Text style={st.savingsItemLabel}>Gains</Text>
              <Text style={[st.savingsItemValue, { color: Colors.success }]}>+₹{totalGains.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </Card>

        <Card style={st.promptCard}>
          <View style={st.promptRow}>
            <FontAwesome name="info-circle" size={16} color={Colors.primary} />
            <Text style={st.promptText}>Keep saving to settle your loans and become debt-free faster.</Text>
          </View>
        </Card>

        <View style={st.fdListHeader}>
          <Text style={st.fdListTitle}>Your Fixed Deposits</Text>
          <Text style={st.fdListCount}>{deposits.length} FD{deposits.length !== 1 ? 's' : ''}</Text>
        </View>

        {deposits.map((fd, i) => (
          <Card key={i} style={st.fdCard}>
            <View style={st.fdTop}>
              <View>
                <Text style={st.fdAmount}>₹{fd.amount.toLocaleString('en-IN')}</Text>
                <Text style={st.fdDate}>{fd.date}</Text>
              </View>
              <Badge status="Active" />
            </View>
            <View style={st.fdMeta}>
              <Text style={st.fdRate}>{fd.interestRate}% p.a.</Text>
              <Text style={st.fdDays}>12 months tenure</Text>
            </View>
          </Card>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {renderModal(false)}
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPage },
  headerCenter: { alignItems: 'center', paddingVertical: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bookBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },

  // Activate
  activateScroll: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#F0EDFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#DDD8FF',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginBottom: 10 },
  heroDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, paddingHorizontal: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F5' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  activateCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16 },
  activateCtaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionTitleText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  featureCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  featureIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // FD view
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
  fdListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  fdListTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  fdListCount: { fontSize: 12, color: Colors.textMuted },
  fdCard: { marginBottom: 10 },
  fdTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  fdAmount: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  fdDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  fdMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fdRate: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  fdDays: { fontSize: 12, color: Colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgPage, borderRadius: 14, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
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
  estimateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.savingsBg, borderRadius: 12, padding: 14, marginTop: 16 },
  estimateLabel: { fontSize: 13, fontWeight: '600', color: Colors.savingsText },
  estimateValue: { fontSize: 16, fontWeight: '700', color: Colors.savingsText },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
})
