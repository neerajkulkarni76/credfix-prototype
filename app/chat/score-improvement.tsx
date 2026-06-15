import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import * as Haptics from 'expo-haptics'

/* ── Bubble Components ── */

function UserBubble({ text }: { text: string }) {
  return (
    <View style={s.userRow}>
      <View style={s.userBubble}>
        <Text style={s.userText}>{text}</Text>
      </View>
    </View>
  )
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.botRow}>
      <View style={s.botAvatar}><Text style={s.avatarText}>R</Text></View>
      <View style={s.botBubble}>{children}</View>
    </View>
  )
}

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current]

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(d, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    )
    anims.forEach(a => a.start())
    return () => anims.forEach(a => a.stop())
  }, [])

  return (
    <View style={s.botRow}>
      <View style={s.botAvatar}><Text style={s.avatarText}>R</Text></View>
      <View style={[s.botBubble, s.typingBubble]}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[s.dot, { transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}
          />
        ))}
      </View>
    </View>
  )
}

/* ── Data ── */

const overdueLoans = [
  { id: 1, lender: 'Bajaj Finserv', type: 'Personal Loan', outstanding: 86200, delay: '9 months', severity: 'severe' },
  { id: 2, lender: 'HDFC Bank', type: 'Personal Loan', outstanding: 53200, delay: '6 months', severity: 'severe' },
  { id: 3, lender: 'Tata Capital', type: 'Personal Loan', outstanding: 41500, delay: '3 months', severity: 'moderate' },
  { id: 4, lender: 'Si Creva', type: 'Personal Loan', outstanding: 18400, delay: '1 month', severity: 'mild' },
]

const SEV_COLORS: Record<string, { bg: string; text: string }> = {
  severe: { bg: '#FEE2E2', text: '#DC2626' },
  moderate: { bg: '#FED7AA', text: '#EA580C' },
  mild: { bg: '#FEF3C7', text: '#D97706' },
}

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN') }

/* ── Main Screen ── */

export default function ScoreImprovementChat() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<number | null>(null)

  const scroll = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

  const advanceTo = (nextStep: number, delay = 1500) => {
    setTyping(true); scroll()
    setTimeout(() => { setTyping(false); setStep(nextStep); scroll() }, delay)
  }

  // Auto-advance: user msg already shown → Risi responds
  useEffect(() => {
    const t = setTimeout(() => advanceTo(1, 2000), 800)
    return () => clearTimeout(t)
  }, [])

  const handleTimeline = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (option === 'this_month') {
      setStep(2.1 as any) // show user msg
      setTimeout(() => advanceTo(3), 300)
    } else if (option === 'next_month') {
      setStep(2.2 as any)
      setTimeout(() => advanceTo(3), 300)
    } else {
      setStep(2.3 as any)
      setTimeout(() => advanceTo(5), 300)
    }
  }

  const handleLoanSelect = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedLoan(id)
    setStep(3.5 as any)
    setTimeout(() => advanceTo(4), 300)
  }

  const handleSendProposal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    advanceTo(4.5 as any)
  }

  const handleStartSaving = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    router.push({ pathname: '/savings-screens', params: { bookNew: '1' } } as any)
  }

  const stepGte = (n: number) => (step as number) >= n

  const selectedLoanData = overdueLoans.find(l => l.id === selectedLoan)

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Score Improvement</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} style={s.chat} contentContainerStyle={s.chatContent} showsVerticalScrollIndicator={false}>

        {/* Step 0: User message */}
        <UserBubble text="Please help me with score improvement" />

        {/* Step 1: Risi analysis */}
        {stepGte(1) && (
          <BotBubble>
            <Text style={s.botText}>
              I've looked at your credit report. Your score is <Text style={s.bold}>624</Text> — and here's exactly why it's low and what we can do about it.
            </Text>
            <Text style={[s.botText, { marginTop: 10 }]}>
              You have <Text style={s.bold}>4 overdue loans</Text> that are pulling your score down:
            </Text>

            {/* Overdue loans */}
            <View style={s.loanList}>
              {overdueLoans.map((loan) => {
                const sev = SEV_COLORS[loan.severity]
                return (
                  <View key={loan.id} style={s.loanCard}>
                    <View style={s.loanHeader}>
                      <View style={s.loanIcon}>
                        <Text style={s.loanInitial}>{loan.lender[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.loanLender}>{loan.lender}</Text>
                        <Text style={s.loanType}>{loan.type}</Text>
                      </View>
                      <View style={[s.delayPill, { backgroundColor: sev.bg }]}>
                        <Text style={[s.delayText, { color: sev.text }]}>Overdue {loan.delay}</Text>
                      </View>
                    </View>
                    <Text style={s.loanOutstanding}>Outstanding: {fmt(loan.outstanding)}</Text>
                  </View>
                )
              })}
            </View>

            <View style={s.insightCard}>
              <FontAwesome name="lightbulb-o" size={14} color="#D97706" />
              <Text style={s.insightText}>
                To start improving your score, these loans need to be resolved — either through settlement or full closure. The good news? You don't have to do it all at once.
              </Text>
            </View>

            <Text style={[s.botText, { marginTop: 10 }]}>
              <Text style={s.bold}>Here's how Credfix can help:</Text>
            </Text>
            <View style={s.helpList}>
              <HelpStep num="1" text="We negotiate the best closure offers with each lender" />
              <HelpStep num="2" text="You can save funds on Credfix at your own pace" />
              <HelpStep num="3" text="Once ready, we close the loan and get you an NOC" />
              <HelpStep num="4" text="Your score starts improving within 30-45 days of each closure" />
            </View>

            <Text style={[s.botText, { marginTop: 12 }]}>
              When would you like to start resolving these loans?
            </Text>
          </BotBubble>
        )}

        {/* Step 2: Timeline options */}
        {stepGte(1) && !stepGte(2.1 as any) && !typing && (
          <View style={s.optionsWrap}>
            <TouchableOpacity style={s.optionBtn} onPress={() => handleTimeline('this_month')} activeOpacity={0.8}>
              <View style={[s.optionDot, { backgroundColor: '#22C55E' }]} />
              <Text style={s.optionText}>I can start this month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.optionBtn} onPress={() => handleTimeline('next_month')} activeOpacity={0.8}>
              <View style={[s.optionDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={s.optionText}>I'll start next month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.optionBtn} onPress={() => handleTimeline('later')} activeOpacity={0.8}>
              <View style={[s.optionDot, { backgroundColor: '#9CA3AF' }]} />
              <Text style={s.optionText}>I need 2+ months to prepare</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User chose this month / next month */}
        {stepGte(2.1 as any) && !stepGte(5) && (
          <UserBubble text={(step as number) >= 2.2 ? "I'll start next month" : "I can start this month"} />
        )}

        {/* Step 3: Select a loan */}
        {stepGte(3) && !stepGte(5) && (
          <BotBubble>
            <Text style={s.botText}>
              That's a great decision! 💪{'\n\n'}Let's start with one loan. I'd suggest beginning with the smallest overdue amount — it's the quickest win and will boost your confidence.
            </Text>
            <Text style={[s.botText, { marginTop: 8 }]}>
              Which loan would you like to resolve first?
            </Text>

            <View style={s.selectLoans}>
              {overdueLoans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  style={[s.selectLoanCard, selectedLoan === loan.id && s.selectLoanCardActive]}
                  onPress={() => handleLoanSelect(loan.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.selectLoanName}>{loan.lender}</Text>
                    <Text style={s.selectLoanSub}>{fmt(loan.outstanding)} outstanding</Text>
                  </View>
                  {loan.id === 4 && (
                    <View style={s.suggestPill}>
                      <Text style={s.suggestText}>Suggested</Text>
                    </View>
                  )}
                  <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </BotBubble>
        )}

        {/* Step 3.5: User selected a loan */}
        {stepGte(3.5 as any) && selectedLoanData && !stepGte(5) && (
          <UserBubble text={`${selectedLoanData.lender} — ${fmt(selectedLoanData.outstanding)}`} />
        )}

        {/* Step 4: Settlement proposal */}
        {stepGte(4) && !stepGte(5) && selectedLoanData && (
          <BotBubble>
            <Text style={s.botText}>
              Let me prepare a settlement proposal for <Text style={s.bold}>{selectedLoanData.lender}</Text>.
            </Text>

            <View style={s.offerCard}>
              <Text style={s.offerTitle}>Settlement Estimate</Text>
              <View style={s.offerRow}>
                <Text style={s.offerLabel}>Outstanding</Text>
                <Text style={s.offerValue}>{fmt(selectedLoanData.outstanding)}</Text>
              </View>
              <View style={s.offerRow}>
                <Text style={s.offerLabel}>Likely Settlement</Text>
                <Text style={[s.offerValue, { color: Colors.primary }]}>{fmt(Math.round(selectedLoanData.outstanding * 0.55))}</Text>
              </View>
              <View style={s.offerDivider} />
              <View style={s.offerRow}>
                <Text style={[s.offerLabel, { fontWeight: '700' }]}>Potential Savings</Text>
                <Text style={[s.offerValue, { color: '#22C55E', fontWeight: '700' }]}>{fmt(Math.round(selectedLoanData.outstanding * 0.45))}</Text>
              </View>
            </View>

            <View style={s.draftCard}>
              <Text style={s.draftTo}>To: recovery@{selectedLoanData.lender.toLowerCase().replace(/\s/g, '')}.com</Text>
              <Text style={s.draftSubject}>Subject: Settlement Proposal — {selectedLoanData.type}</Text>
              <View style={s.offerDivider} />
              <Text style={s.draftBody}>
                Dear Sir/Madam,{'\n\n'}I am writing to propose a one-time settlement for my outstanding loan of {fmt(selectedLoanData.outstanding)}.{'\n\n'}I am willing to pay {fmt(Math.round(selectedLoanData.outstanding * 0.55))} as a one-time settlement within 7 working days of acceptance.{'\n\n'}Kindly consider this proposal and issue a No Objection Certificate upon settlement.{'\n\n'}Regards,{'\n'}Sunil Singh
              </Text>
            </View>

            <TouchableOpacity style={s.primaryBtn} onPress={handleSendProposal} activeOpacity={0.8}>
              <FontAwesome name="send" size={13} color={Colors.white} />
              <Text style={s.primaryBtnText}>Send Proposal to {selectedLoanData.lender}</Text>
            </TouchableOpacity>
          </BotBubble>
        )}

        {/* Step 4.5: Proposal sent success */}
        {stepGte(4.5 as any) && selectedLoanData && (
          <BotBubble>
            <View style={s.successWrap}>
              <View style={s.successIcon}>
                <FontAwesome name="check" size={18} color={Colors.white} />
              </View>
              <Text style={s.successTitle}>Proposal sent!</Text>
            </View>
            <Text style={s.botText}>
              Your settlement proposal has been sent to {selectedLoanData.lender}. They usually respond within 3-5 working days.{'\n\n'}I'll notify you the moment they reply. In the meantime, your score improvement journey has officially begun! 🎉
            </Text>
            <View style={s.tracker}>
              {['Proposal Sent', 'Bank Reviews', 'Offer Accepted', 'Payment', 'NOC & Score Update'].map((label, i) => (
                <View key={i} style={s.trackerStep}>
                  <View style={[s.trackerDot, i === 0 && s.trackerDotActive]} />
                  {i < 4 && <View style={[s.trackerLine, i === 0 && s.trackerLineActive]} />}
                  <Text style={[s.trackerLabel, i === 0 && s.trackerLabelActive]}>{label}</Text>
                </View>
              ))}
            </View>
          </BotBubble>
        )}

        {/* User chose 2+ months */}
        {stepGte(2.3 as any) && stepGte(5) && (
          <UserBubble text="I need 2+ months to prepare" />
        )}

        {/* Step 5: Delay path — save on Credfix */}
        {stepGte(5) && (
          <BotBubble>
            <Text style={s.botText}>
              I understand — and that's completely okay. But here's something important:
            </Text>

            <View style={s.warningCard}>
              <FontAwesome name="exclamation-circle" size={14} color="#DC2626" />
              <Text style={s.warningText}>
                Every month of delay adds to your overdue count, which further lowers your credit score. The sooner we start, the better the outcome.
              </Text>
            </View>

            <Text style={[s.botText, { marginTop: 10 }]}>
              Here's what I suggest — <Text style={s.bold}>start saving now, resolve later</Text>:
            </Text>

            <View style={s.savePlan}>
              <SaveStep num="1" title="Save monthly on Credfix" desc="Put aside whatever you can — even ₹2,000/month helps. Your savings earn 7.5% interest as an FD." />
              <SaveStep num="2" title="We negotiate in parallel" desc="While you save, I'll start talking to your lenders and get the best settlement offers ready." />
              <SaveStep num="3" title="Close loans when fund is ready" desc="Once you've accumulated enough, we close the loan, get the NOC, and your score starts recovering." />
            </View>

            <Text style={[s.botText, { marginTop: 10 }]}>
              Even <Text style={s.bold}>₹3,000–5,000 per month</Text> can help you close your smallest loan ({overdueLoans[3].lender} — {fmt(overdueLoans[3].outstanding)}) in about 4 months.
            </Text>

            <TouchableOpacity style={s.primaryBtn} onPress={handleStartSaving} activeOpacity={0.8}>
              <FontAwesome name="plus-circle" size={14} color={Colors.white} />
              <Text style={s.primaryBtnText}>Start saving on Credfix</Text>
            </TouchableOpacity>
          </BotBubble>
        )}

        {/* Step 6: Savings setup confirmation */}
        {stepGte(6) && (
          <BotBubble>
            <View style={s.successWrap}>
              <View style={s.successIcon}>
                <FontAwesome name="check" size={18} color={Colors.white} />
              </View>
              <Text style={s.successTitle}>You're all set!</Text>
            </View>
            <Text style={s.botText}>
              Here's your score improvement plan:
            </Text>
            <View style={s.planCard}>
              <PlanItem icon="inr" text="Save monthly in Credfix FD @ 7.5% interest" />
              <PlanItem icon="comments" text="I'll negotiate with all 4 lenders in parallel" />
              <PlanItem icon="bell" text="I'll alert you when a good settlement offer comes in" />
              <PlanItem icon="trophy" text="Target: First loan closure within 4-5 months" />
            </View>
            <Text style={[s.botText, { marginTop: 10 }]}>
              You've taken the hardest step — deciding to fix this. I'll be here every step of the way. 💙
            </Text>
          </BotBubble>
        )}

        {typing && <TypingIndicator />}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom chips */}
      <View style={s.quickReplies}>
        {stepGte(4.5 as any) && !stepGte(5) && (
          <>
            <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)'); }}>
              <Text style={s.chipText}>Go home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.chip} onPress={() => Haptics.selectionAsync()}>
              <Text style={s.chipText}>Resolve another loan</Text>
            </TouchableOpacity>
          </>
        )}
        {stepGte(6) && (
          <>
            <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.push({ pathname: '/savings-screens', params: { bookNew: '1' } } as any); }}>
              <Text style={s.chipText}>Go to Savings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)'); }}>
              <Text style={s.chipText}>Go home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

/* ── Helper Components ── */

function HelpStep({ num, text }: { num: string; text: string }) {
  return (
    <View style={s.helpStep}>
      <View style={s.helpNum}><Text style={s.helpNumText}>{num}</Text></View>
      <Text style={s.helpStepText}>{text}</Text>
    </View>
  )
}

function SaveStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <View style={s.saveStep}>
      <View style={s.saveNum}><Text style={s.saveNumText}>{num}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={s.saveTitle}>{title}</Text>
        <Text style={s.saveDesc}>{desc}</Text>
      </View>
    </View>
  )
}

function PlanItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={s.planItem}>
      <View style={s.planItemIcon}>
        <FontAwesome name={icon as any} size={12} color={Colors.primary} />
      </View>
      <Text style={s.planItemText}>{text}</Text>
    </View>
  )
}

/* ── Styles ── */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  chat: { flex: 1 },
  chatContent: { padding: 16 },

  // Bubbles
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%' },
  userText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  botAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  botBubble: { backgroundColor: '#F9FAFB', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, maxWidth: '85%', flex: 1 },
  botText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  bold: { fontWeight: '700' },

  // Typing
  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: 16, maxWidth: 70 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C0C0C8' },

  // Loan list
  loanList: { marginTop: 12, gap: 8 },
  loanCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  loanHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  loanIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  loanInitial: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  loanLender: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  loanType: { fontSize: 10, color: Colors.textMuted },
  delayPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  delayText: { fontSize: 10, fontWeight: '700' },
  loanOutstanding: { fontSize: 12, color: Colors.textSecondary, marginLeft: 36 },

  // Insight card
  insightCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12,
    backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FEF3C7',
  },
  insightText: { fontSize: 12, color: '#92400E', lineHeight: 18, flex: 1 },

  // Help steps
  helpList: { marginTop: 8, gap: 8 },
  helpStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  helpNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  helpNumText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  helpStepText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 19 },

  // Options
  optionsWrap: { gap: 8, marginBottom: 12, marginLeft: 38 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  optionDot: { width: 8, height: 8, borderRadius: 4 },
  optionText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  // Select loans
  selectLoans: { marginTop: 10, gap: 6 },
  selectLoanCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  selectLoanCardActive: { borderColor: Colors.primary, backgroundColor: '#F8F7FF' },
  selectLoanName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  selectLoanSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  suggestPill: { backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  suggestText: { fontSize: 9, fontWeight: '700', color: '#059669' },

  // Offer card
  offerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginTop: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  offerTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  offerLabel: { fontSize: 12, color: Colors.textSecondary },
  offerValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  offerDivider: { height: 1, backgroundColor: '#F0F0F5', marginVertical: 6 },

  // Draft card
  draftCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  draftTo: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  draftSubject: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  draftBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Primary button
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  // Warning card
  warningCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10,
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FECACA',
  },
  warningText: { fontSize: 12, color: '#991B1B', lineHeight: 18, flex: 1 },

  // Save plan
  savePlan: { marginTop: 12, gap: 12 },
  saveStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  saveNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  saveNumText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  saveTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  saveDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginTop: 2 },

  // Success
  successWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  successIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#22C55E' },

  // Tracker
  tracker: { flexDirection: 'row', marginTop: 14 },
  trackerStep: { flex: 1, alignItems: 'center' },
  trackerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', marginBottom: 4 },
  trackerDotActive: { backgroundColor: Colors.primary },
  trackerLine: { position: 'absolute', top: 4, left: '50%', right: '-50%', height: 2, backgroundColor: '#E5E7EB' },
  trackerLineActive: { backgroundColor: Colors.primary },
  trackerLabel: { fontSize: 8, color: Colors.textMuted, textAlign: 'center' },
  trackerLabelActive: { color: Colors.primary, fontWeight: '600' },

  // Plan card
  planCard: { marginTop: 10, gap: 10 },
  planItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planItemIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  planItemText: { fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },

  // Quick replies
  quickReplies: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  chip: {
    backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
})
