import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { loans } from '@/data/mockData'
import * as Haptics from 'expo-haptics'

/* ── Inline Components ── */

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{text}</Text>
      </View>
    </View>
  )
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.botRow}>
      <View style={styles.botAvatar}><Text style={styles.avatarText}>C+</Text></View>
      <View style={styles.botBubble}>{children}</View>
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
    <View style={styles.botRow}>
      <View style={styles.botAvatar}><Text style={styles.avatarText}>C+</Text></View>
      <View style={[styles.botBubble, styles.typingBubble]}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}
          />
        ))}
      </View>
    </View>
  )
}

/* ── Main Screen ── */

export default function SettlementChatScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

  useEffect(() => {
    // Auto-advance from step 0 -> step 1
    const timer = setTimeout(() => {
      setTyping(true)
      scrollToEnd()
      setTimeout(() => { setTyping(false); setStep(1); scrollToEnd() }, 1500)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLoanSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setTyping(true); scrollToEnd()
    setTimeout(() => { setTyping(false); setStep(2); scrollToEnd() }, 1500)
  }

  const handleApprove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setTyping(true); scrollToEnd()
    setTimeout(() => { setTyping(false); setStep(3); scrollToEnd() }, 1500)
  }

  const handleSend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setTyping(true); scrollToEnd()
    setTimeout(() => { setTyping(false); setStep(4); scrollToEnd() }, 1500)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settlement Assistant</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
        {/* Step 0: User message */}
        <UserBubble text="I want to settle my loans" />

        {/* Step 1: Bot explains + loan list */}
        {step >= 1 && (
          <BotBubble>
            <Text style={styles.botText}>
              I can help you settle your outstanding loans. Settlement means paying a lump sum amount that is lower than your total outstanding.{'\n\n'}Here are your active loans:
            </Text>
            <View style={styles.loanList}>
              {loans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  style={[styles.loanCard, loan.recommended && styles.loanCardRecommended]}
                  activeOpacity={0.7}
                  onPress={loan.bank === 'Bajaj Finserv' ? handleLoanSelect : undefined}
                >
                  <View style={styles.loanTop}>
                    <Text style={styles.loanBank}>{loan.bank}</Text>
                    {loan.recommended && (
                      <View style={styles.recommendBadge}>
                        <Text style={styles.recommendText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.loanType}>{loan.type}</Text>
                  <Text style={styles.loanAmount}>{'\u20B9'}{loan.amount.toLocaleString('en-IN')}</Text>
                  {loan.alert && <Text style={styles.loanAlert}>{loan.alert}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </BotBubble>
        )}

        {/* Step 2: Settlement offer */}
        {step >= 2 && (
          <>
            <UserBubble text="Bajaj Finserv - Personal Loan" />
            <BotBubble>
              <Text style={styles.botText}>
                Based on your profile and Bajaj Finserv's recent settlement patterns, here's what I recommend:
              </Text>
              <Card style={styles.offerCard}>
                <Text style={styles.offerTitle}>Settlement Offer</Text>
                <View style={styles.offerRow}>
                  <Text style={styles.offerLabel}>Outstanding</Text>
                  <Text style={styles.offerValue}>{'\u20B9'}86,200</Text>
                </View>
                <View style={styles.offerRow}>
                  <Text style={styles.offerLabel}>Likely Settlement</Text>
                  <Text style={[styles.offerValue, { color: Colors.primary }]}>{'\u20B9'}47,000</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.offerRow}>
                  <Text style={[styles.offerLabel, { fontWeight: '700' }]}>You Save</Text>
                  <Text style={[styles.offerValue, { color: Colors.success, fontWeight: '700' }]}>{'\u20B9'}39,200</Text>
                </View>
              </Card>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleApprove} activeOpacity={0.8}>
                <FontAwesome name="check" size={14} color={Colors.white} />
                <Text style={styles.primaryBtnText}>Approve & Send</Text>
              </TouchableOpacity>
            </BotBubble>
          </>
        )}

        {/* Step 3: Email draft */}
        {step >= 3 && (
          <BotBubble>
            <Text style={styles.botText}>I've drafted a settlement proposal email:</Text>
            <Card style={styles.draftCard}>
              <Text style={styles.draftHeader}>To: recovery@bajajfinserv.in</Text>
              <Text style={styles.draftHeader}>Subject: Settlement Proposal - Loan BFL-9384021</Text>
              <View style={styles.divider} />
              <Text style={styles.draftBody}>
                Dear Sir/Madam,{'\n\n'}I am writing to propose a one-time settlement for my personal loan account BFL-9384021 with an outstanding balance of {'\u20B9'}86,200.{'\n\n'}I am willing to pay {'\u20B9'}47,000 as a one-time settlement amount within 7 working days of acceptance.{'\n\n'}I request you to kindly consider this proposal and issue a No Objection Certificate (NOC) upon settlement.{'\n\n'}Regards,{'\n'}Sunil Singh
              </Text>
            </Card>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSend} activeOpacity={0.8}>
              <FontAwesome name="send" size={14} color={Colors.white} />
              <Text style={styles.primaryBtnText}>Send</Text>
            </TouchableOpacity>
          </BotBubble>
        )}

        {/* Step 4: Success */}
        {step >= 4 && (
          <BotBubble>
            {(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); return null; })()}
            <View style={styles.successIcon}>
              <FontAwesome name="check-circle" size={40} color={Colors.success} />
            </View>
            <Text style={[styles.botText, { textAlign: 'center', fontWeight: '600', marginBottom: 8 }]}>
              Settlement proposal sent successfully!
            </Text>
            <Text style={[styles.botText, { textAlign: 'center', marginBottom: 16 }]}>
              Your proposal has been sent to Bajaj Finserv. Here's your progress:
            </Text>
            <View style={styles.tracker}>
              {['Proposal Sent', 'Bank Reviews', 'Offer Accepted', 'Payment', 'NOC Issued'].map((label, i) => (
                <View key={i} style={styles.trackerStep}>
                  <View style={[styles.trackerDot, i === 0 && styles.trackerDotActive]} />
                  {i < 4 && <View style={[styles.trackerLine, i === 0 && styles.trackerLineActive]} />}
                  <Text style={[styles.trackerLabel, i === 0 && styles.trackerLabelActive]}>{label}</Text>
                </View>
              ))}
            </View>
          </BotBubble>
        )}

        {typing && <TypingIndicator />}
      </ScrollView>

      {/* Quick replies */}
      <View style={styles.quickReplies}>
        {step < 2 && (
          <>
            <TouchableOpacity style={styles.chip} onPress={() => Haptics.selectionAsync()}><Text style={styles.chipText}>What is settlement?</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => Haptics.selectionAsync()}><Text style={styles.chipText}>Will it affect my CIBIL?</Text></TouchableOpacity>
          </>
        )}
        {step === 4 && (
          <>
            <TouchableOpacity style={styles.chip} onPress={() => { Haptics.selectionAsync(); router.push('/chat/risi-hub'); }}>
              <Text style={styles.chipText}>Back to Risi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => Haptics.selectionAsync()}><Text style={styles.chipText}>Settle another loan</Text></TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPage },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgPage, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  chat: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8 },
  userRow: { alignItems: 'flex-end', marginBottom: 16 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '80%' },
  userText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 8 },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  botBubble: { backgroundColor: Colors.white, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '82%', borderWidth: 1, borderColor: '#F3F4F6' },
  botText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 16, paddingHorizontal: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  loanList: { marginTop: 12, gap: 8 },
  loanCard: { backgroundColor: Colors.bgPage, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  loanCardRecommended: { borderColor: Colors.primary, borderWidth: 1.5 },
  loanTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  loanBank: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  recommendBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  recommendText: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  loanType: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  loanAmount: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  loanAlert: { fontSize: 11, color: Colors.alert, fontWeight: '600', marginTop: 4 },
  offerCard: { marginTop: 12, backgroundColor: Colors.bgPage },
  offerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  offerLabel: { fontSize: 13, color: Colors.textSecondary },
  offerValue: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, marginTop: 12,
  },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  draftCard: { marginTop: 12, backgroundColor: Colors.bgPage },
  draftHeader: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  draftBody: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  successIcon: { alignItems: 'center', marginBottom: 12 },
  tracker: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 },
  trackerStep: { alignItems: 'center', flex: 1 },
  trackerDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.border, marginBottom: 6 },
  trackerDotActive: { backgroundColor: Colors.success },
  trackerLine: { position: 'absolute', top: 6, left: '60%', right: '-40%', height: 2, backgroundColor: Colors.border },
  trackerLineActive: { backgroundColor: Colors.success },
  trackerLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  trackerLabelActive: { color: Colors.success, fontWeight: '600' },
  quickReplies: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white,
  },
  chip: { backgroundColor: Colors.chipBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
})
