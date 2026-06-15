import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { fdList } from '@/data/mockData'

const TABS = ['All', 'Active', 'Pending'] as const

export default function FixedDepositsScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All')
  const [showModal, setShowModal] = useState(false)
  const [fdAmount, setFdAmount] = useState('')

  const filteredFDs = activeTab === 'All'
    ? fdList
    : fdList.filter((fd) => fd.status === activeTab)

  const totalInvested = fdList.reduce((sum, fd) => sum + fd.amount, 0)
  const totalGains = 2800
  const totalSavings = totalInvested + totalGains

  const maturityProgress = (fd: typeof fdList[0]) => {
    const total = 365
    const elapsed = total - fd.daysRemaining
    return Math.min(elapsed / total, 1)
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
          <Text style={styles.savingsAmount}>{'\u20B9'}{totalSavings.toLocaleString('en-IN')}</Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsItem}>
              <Text style={styles.savingsItemLabel}>Total Invested</Text>
              <Text style={styles.savingsItemValue}>{'\u20B9'}{totalInvested.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.savingsDivider} />
            <View style={styles.savingsItem}>
              <Text style={styles.savingsItemLabel}>Gains</Text>
              <Text style={[styles.savingsItemValue, { color: Colors.success }]}>+{'\u20B9'}{totalGains.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </Card>

        {/* Settlement prompt */}
        <Card style={styles.promptCard}>
          <View style={styles.promptRow}>
            <FontAwesome name="info-circle" size={16} color={Colors.primary} />
            <Text style={styles.promptText}>
              Save {'\u20B9'}15,500 more to settle your HDFC loan and become debt-free faster.
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
                <Text style={styles.fdAmount}>{'\u20B9'}{fd.amount.toLocaleString('en-IN')}</Text>
                <Text style={styles.fdDate}>{fd.date}</Text>
              </View>
              <Badge status={fd.status} />
            </View>
            <View style={styles.fdMeta}>
              <Text style={styles.fdRate}>{fd.interestRate}% p.a.</Text>
              <Text style={styles.fdDays}>{fd.daysRemaining} days remaining</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${maturityProgress(fd) * 100}%` }]} />
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
              <Text style={styles.rupeeSign}>{'\u20B9'}</Text>
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
                    {'\u20B9'}{amt.toLocaleString('en-IN')}
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
                  {'\u20B9'}{Math.round(Number(fdAmount) * 1.075).toLocaleString('en-IN')}
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
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.primary },
  /* Modal */
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
