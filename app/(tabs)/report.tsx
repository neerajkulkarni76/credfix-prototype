import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { userProfile } from '@/data/mockData'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

type DPDSeverity = 'current' | 'mild' | 'moderate' | 'severe'

interface CreditLoan {
  id: number
  lender: string
  type: string
  accountNo: string
  loanAmount: number
  principalOutstanding: number
  dueAmount: number
  dpd: number
  severity: DPDSeverity
}

const creditLoans: CreditLoan[] = [
  { id: 1, lender: 'Bajaj Finserv', type: 'Personal Loan', accountNo: 'BFL-9384021', loanAmount: 150000, principalOutstanding: 86200, dueAmount: 92450, dpd: 275, severity: 'severe' },
  { id: 2, lender: 'HDFC Bank', type: 'Personal Loan', accountNo: 'HDFC-XX1234', loanAmount: 80000, principalOutstanding: 53200, dueAmount: 58900, dpd: 180, severity: 'severe' },
  { id: 3, lender: 'Tata Capital', type: 'Personal Loan', accountNo: 'TC-884521', loanAmount: 60000, principalOutstanding: 41500, dueAmount: 44200, dpd: 85, severity: 'moderate' },
  { id: 4, lender: 'Si Creva', type: 'Personal Loan', accountNo: 'SC-772190', loanAmount: 25000, principalOutstanding: 18400, dueAmount: 19100, dpd: 31, severity: 'mild' },
  { id: 5, lender: 'Mpokket', type: 'Short-term Loan', accountNo: 'MPK-991201', loanAmount: 8000, principalOutstanding: 3200, dueAmount: 3200, dpd: 0, severity: 'current' },
  { id: 6, lender: 'Mpokket', type: 'Short-term Loan', accountNo: 'MPK-991445', loanAmount: 5000, principalOutstanding: 1800, dueAmount: 1800, dpd: 0, severity: 'current' },
  { id: 7, lender: 'Mpokket', type: 'Short-term Loan', accountNo: 'MPK-991672', loanAmount: 2000, principalOutstanding: 2000, dueAmount: 2000, dpd: 0, severity: 'current' },
]

const SEVERITY_CONFIG: Record<DPDSeverity, { bg: string; text: string; label: string }> = {
  current: { bg: '#D1FAE5', text: '#059669', label: 'Current' },
  mild: { bg: '#FEF3C7', text: '#D97706', label: 'Overdue' },
  moderate: { bg: '#FED7AA', text: '#EA580C', label: 'Overdue' },
  severe: { bg: '#FEE2E2', text: '#DC2626', label: 'Default' },
}

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function ScoreRing({ score }: { score: number }) {
  // Score 300-900 range
  const pct = Math.min(Math.max((score - 300) / 600, 0), 1)
  let ringColor = '#DC2626'
  let label = 'Poor'
  if (pct > 0.7) { ringColor = '#22C55E'; label = 'Excellent'; }
  else if (pct > 0.55) { ringColor = '#84CC16'; label = 'Good'; }
  else if (pct > 0.4) { ringColor = '#D97706'; label = 'Fair'; }
  else if (pct > 0.25) { ringColor = '#EA580C'; label = 'Below Average'; }

  return (
    <View style={scoreStyles.wrap}>
      {/* Track */}
      <View style={scoreStyles.track} />
      {/* Fill — using border trick for partial ring */}
      <View style={[scoreStyles.fill, {
        borderTopColor: ringColor,
        borderRightColor: pct > 0.25 ? ringColor : 'transparent',
        borderBottomColor: pct > 0.5 ? ringColor : 'transparent',
        borderLeftColor: pct > 0.75 ? ringColor : 'transparent',
      }]} />
      <View style={scoreStyles.inner}>
        <Text style={scoreStyles.num}>{score}</Text>
        <Text style={[scoreStyles.label, { color: ringColor }]}>{label}</Text>
        <Text style={scoreStyles.of}>out of 900</Text>
      </View>
    </View>
  )
}

const scoreStyles = StyleSheet.create({
  wrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  track: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 8, borderColor: '#F0EDFF',
  },
  fill: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 8, transform: [{ rotate: '-45deg' }],
  },
  inner: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  num: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary, lineHeight: 40 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  of: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
})

function formatDpd(dpd: number): string {
  if (dpd === 0) return 'Up to date'
  if (dpd <= 90) return `Late by ${dpd} days`
  const months = Math.round(dpd / 30)
  return `Overdue ${months} months`
}

function LoanCard({ loan }: { loan: CreditLoan }) {
  const sev = SEVERITY_CONFIG[loan.severity]
  return (
    <View style={loanStyles.card}>
      {/* Header */}
      <View style={loanStyles.header}>
        <View style={loanStyles.lenderRow}>
          <View style={loanStyles.lenderIcon}>
            <Text style={loanStyles.lenderInitial}>{loan.lender[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={loanStyles.lenderName}>{loan.lender}</Text>
            <Text style={loanStyles.loanType}>{loan.type} · {loan.accountNo}</Text>
          </View>
        </View>
        <View style={[loanStyles.dpdPill, { backgroundColor: sev.bg }]}>
          <Text style={[loanStyles.dpdText, { color: sev.text }]}>
            {formatDpd(loan.dpd)}
          </Text>
        </View>
      </View>

      {/* Details grid */}
      <View style={loanStyles.grid}>
        <View style={loanStyles.gridItem}>
          <Text style={loanStyles.gridLabel}>Loan Amount</Text>
          <Text style={loanStyles.gridValue}>{formatCurrency(loan.loanAmount)}</Text>
        </View>
        <View style={loanStyles.gridDivider} />
        <View style={loanStyles.gridItem}>
          <Text style={loanStyles.gridLabel}>Principal O/S</Text>
          <Text style={loanStyles.gridValue}>{formatCurrency(loan.principalOutstanding)}</Text>
        </View>
        <View style={loanStyles.gridDivider} />
        <View style={loanStyles.gridItem}>
          <Text style={loanStyles.gridLabel}>Due Amount</Text>
          <Text style={[loanStyles.gridValue, loan.dpd > 0 && { color: sev.text }]}>
            {formatCurrency(loan.dueAmount)}
          </Text>
        </View>
      </View>
    </View>
  )
}

const loanStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#F0F0F5',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  lenderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  lenderIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  lenderInitial: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  lenderName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  loanType: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  dpdPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dpdText: { fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  gridItem: { flex: 1, alignItems: 'center' },
  gridLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginBottom: 4 },
  gridValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  gridDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
})

export default function ReportScreen() {
  const router = useRouter()
  const score = userProfile.creditScore

  const totalOutstanding = creditLoans.reduce((sum, l) => sum + l.principalOutstanding, 0)
  const totalDue = creditLoans.reduce((sum, l) => sum + l.dueAmount, 0)
  const overdueLoans = creditLoans.filter((l) => l.dpd > 0).length
  const currentLoans = creditLoans.filter((l) => l.dpd === 0).length

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Credit Report</Text>
          <View style={s.sourcePill}>
            <Text style={s.sourceText}>Experian</Text>
          </View>
        </View>

        {/* Score card */}
        <View style={s.scoreCard}>
          <ScoreRing score={score} />
          <View style={s.scoreInfo}>
            <View style={s.scoreStatRow}>
              <View style={s.scoreStat}>
                <Text style={s.scoreStatNum}>{creditLoans.length}</Text>
                <Text style={s.scoreStatLabel}>Active Loans</Text>
              </View>
              <View style={s.scoreStatDivider} />
              <View style={s.scoreStat}>
                <Text style={[s.scoreStatNum, { color: '#DC2626' }]}>{overdueLoans}</Text>
                <Text style={s.scoreStatLabel}>Overdue</Text>
              </View>
              <View style={s.scoreStatDivider} />
              <View style={s.scoreStat}>
                <Text style={[s.scoreStatNum, { color: '#059669' }]}>{currentLoans}</Text>
                <Text style={s.scoreStatLabel}>Current</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary strip */}
        <View style={s.summaryStrip}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total Outstanding</Text>
            <Text style={s.summaryValue}>{formatCurrency(totalOutstanding)}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total Due</Text>
            <Text style={[s.summaryValue, { color: '#DC2626' }]}>{formatCurrency(totalDue)}</Text>
          </View>
        </View>

        {/* Risi CTA */}
        <TouchableOpacity
          style={s.risiCta}
          activeOpacity={0.85}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/chat/score-improvement'); }}
        >
          <View style={s.risiCtaLeft}>
            <View style={s.risiCtaDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.risiCtaTitle}>Want to improve your score?</Text>
              <Text style={s.risiCtaSub}>Risi can create a personalised plan for you</Text>
            </View>
          </View>
          <View style={s.risiCtaArrow}>
            <FontAwesome name="arrow-right" size={11} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* Loan list */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Open Loans</Text>
          <Text style={s.sectionCount}>{creditLoans.length} accounts</Text>
        </View>

        {creditLoans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <FontAwesome name="clock-o" size={10} color={Colors.textMuted} />
          <Text style={s.footerText}>Last updated · 14 June 2026</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 20 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  sourcePill: {
    backgroundColor: '#F0EDFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#DDD8FF',
  },
  sourceText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  // Score card
  scoreCard: {
    alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 22, padding: 24, marginBottom: 14,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  scoreInfo: { marginTop: 16, width: '100%' },
  scoreStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  scoreStat: { flex: 1, alignItems: 'center' },
  scoreStatNum: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  scoreStatLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  scoreStatDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },

  // Summary
  summaryStrip: {
    flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  summaryDivider: { width: 1, backgroundColor: '#E5E7EB' },

  // Risi CTA
  risiCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F0EDFF', borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: '#DDD8FF',
  },
  risiCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  risiCtaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  risiCtaTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  risiCtaSub: { fontSize: 11, color: '#8B7FCC', marginTop: 2 },
  risiCtaArrow: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionCount: { fontSize: 12, color: Colors.textMuted },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
  footerText: { fontSize: 11, color: Colors.textMuted },
})
