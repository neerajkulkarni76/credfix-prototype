import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import * as Haptics from 'expo-haptics'

/* ── Shared Components ── */

function UserBubble({ text }: { text: string }) {
  return <View style={s.userRow}><View style={s.userBubble}><Text style={s.userText}>{text}</Text></View></View>
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.botRow}>
      <View style={s.botAvatarWrap}><Image source={require('@/assets/risi-nav.png')} style={s.botAvatarImg} resizeMode="contain" /></View>
      <View style={s.botBubble}>{children}</View>
    </View>
  )
}

function Timestamp({ text }: { text: string }) {
  return <View style={s.tsWrap}><Text style={s.tsText}>{text}</Text></View>
}

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current]
  useEffect(() => { dots.forEach((d, i) => { Animated.loop(Animated.sequence([Animated.delay(i * 200), Animated.timing(d, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(d, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])).start() }) }, [])
  return (
    <View style={s.botRow}>
      <View style={s.botAvatarWrap}><Image source={require('@/assets/risi-nav.png')} style={s.botAvatarImg} resizeMode="contain" /></View>
      <View style={[s.botBubble, s.typingBubble]}>{dots.map((d, i) => <Animated.View key={i} style={[s.dot, { transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]} />)}</View>
    </View>
  )
}

/* ── Main ── */

export default function SettlementChatScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)

  const scroll = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  const advanceTo = (next: number, delay = 1500) => { setTyping(true); scroll(); setTimeout(() => { setTyping(false); setStep(next); scroll() }, delay) }

  useEffect(() => { const t = setTimeout(() => advanceTo(1, 1800), 800); return () => clearTimeout(t) }, [])

  const handleAccept = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(2); setTimeout(() => advanceTo(3), 300) }
  const handleRenegotiate = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(5); setTimeout(() => advanceTo(6), 300) }
  const handleSendAccept = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); advanceTo(4) }
  const handleSendCounter = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); advanceTo(7) }

  const gte = (n: number) => step >= n

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/chat/risi-hub')} style={s.backBtn}><FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} /></TouchableOpacity>
        <View style={s.headerCenter}><Text style={s.headerTitle}>Bajaj Finserv</Text><Text style={s.headerSub}>Settlement Thread</Text></View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} style={s.chat} contentContainerStyle={s.chatContent} showsVerticalScrollIndicator={false}>

        {/* ── 4 June — User initiates ── */}
        <Timestamp text="4 June 2026" />
        <UserBubble text="I want to settle my loans" />

        <BotBubble>
          <Text style={s.botText}>I can help with that. Let me pull up your active loans.</Text>
        </BotBubble>

        <BotBubble>
          <Text style={s.botText}>Here are your outstanding loans:</Text>
          <View style={s.loanMiniList}>
            <View style={[s.loanMini, s.loanMiniSelected]}>
              <View style={{ flex: 1 }}>
                <Text style={s.loanMiniName}>Bajaj Finserv</Text>
                <Text style={s.loanMiniSub}>Personal Loan · ₹86,200</Text>
              </View>
              <View style={s.loanMiniRec}><Text style={s.loanMiniRecText}>Recommended</Text></View>
            </View>
            <View style={s.loanMini}>
              <View style={{ flex: 1 }}>
                <Text style={s.loanMiniName}>HDFC Bank</Text>
                <Text style={s.loanMiniSub}>Personal Loan · ₹53,200</Text>
              </View>
            </View>
            <View style={s.loanMini}>
              <View style={{ flex: 1 }}>
                <Text style={s.loanMiniName}>Axis Bank</Text>
                <Text style={s.loanMiniSub}>Credit Card · ₹1,46,200</Text>
              </View>
            </View>
          </View>
        </BotBubble>

        <UserBubble text="Let's start with Bajaj Finserv" />

        {/* ── 5 June — Risi estimates & sends proposal ── */}
        <Timestamp text="5 June 2026" />

        <BotBubble>
          <Text style={s.botText}>Based on Bajaj Finserv's recent settlement patterns, here's my estimate:</Text>
          <View style={s.offerCard}>
            <Text style={s.offerCardTitle}>Risi's Estimate</Text>
            <View style={s.offerRow}><Text style={s.offerLabel}>Outstanding</Text><Text style={s.offerValue}>₹86,200</Text></View>
            <View style={s.offerRow}><Text style={s.offerLabel}>Estimated Settlement</Text><Text style={[s.offerValue, { color: Colors.primary }]}>₹43,000 – ₹48,000</Text></View>
            <View style={s.offerDivider} />
            <View style={s.offerRow}><Text style={[s.offerLabel, { fontWeight: '700' }]}>Potential Savings</Text><Text style={[s.offerValue, { color: '#22C55E', fontWeight: '700' }]}>₹38,200 – ₹43,200</Text></View>
          </View>
          <Text style={[s.botText, { marginTop: 8 }]}>Shall I send a settlement proposal to Bajaj Finserv?</Text>
        </BotBubble>

        <UserBubble text="Yes, go ahead and send the proposal" />

        <BotBubble>
          <Text style={s.botText}>Done! I've sent a settlement proposal to Bajaj Finserv proposing ₹45,000 as a one-time settlement. Here's the tracker:</Text>
          <View style={s.trackerCard}>
            {['Proposal Sent', 'Bank Reviews', 'Lender Response'].map((label, i) => (
              <View key={i} style={s.trackerStep}>
                <View style={[s.trackerDot, i <= 1 && s.trackerDotDone]}>{i <= 1 && <FontAwesome name="check" size={7} color="#FFF" />}</View>
                {i < 2 && <View style={[s.trackerLine, i === 0 && s.trackerLineDone]} />}
                <Text style={[s.trackerLabel, i <= 1 && s.trackerLabelDone]}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={[s.botText, { marginTop: 8, fontSize: 12, color: Colors.textSecondary }]}>I'll notify you as soon as they respond.</Text>
        </BotBubble>

        {/* ── Today — Lender responds ── */}
        <Timestamp text="Today" />

        {gte(1) && (
          <BotBubble>
            <View style={s.newBadge}><View style={s.newBadgeDot} /><Text style={s.newBadgeText}>Lender Responded</Text></View>
            <Text style={[s.botText, { marginTop: 8 }]}>
              Bajaj Finserv has responded. Their offer is slightly higher than my estimate, but still a solid deal:
            </Text>
            <View style={s.offerCard}>
              <Text style={s.offerCardTitle}>Bajaj Finserv's Offer</Text>
              <View style={s.offerRow}><Text style={s.offerLabel}>Outstanding</Text><Text style={s.offerValue}>₹86,200</Text></View>
              <View style={s.offerRow}><Text style={s.offerLabel}>Their Offer</Text><Text style={[s.offerValue, { color: Colors.primary }]}>₹50,000</Text></View>
              <View style={s.offerDivider} />
              <View style={s.offerRow}><Text style={[s.offerLabel, { fontWeight: '700' }]}>You Save</Text><Text style={[s.offerValue, { color: '#22C55E', fontWeight: '700' }]}>₹36,200 (42%)</Text></View>
              <View style={s.offerRow}><Text style={s.offerLabel}>Valid Till</Text><Text style={[s.offerValue, { color: Colors.alert }]}>25 June 2026</Text></View>
            </View>
            <Text style={[s.botText, { marginTop: 8 }]}>
              We proposed ₹45,000 — they came back at ₹50,000. That's a <Text style={s.bold}>42% discount</Text>. I can try to push lower, or you can accept this and close it.
            </Text>
          </BotBubble>
        )}

        {/* Accept / Renegotiate */}
        {gte(1) && !gte(2) && !gte(5) && !typing && (
          <View style={s.optionsWrap}>
            <TouchableOpacity style={s.optPrimary} onPress={handleAccept} activeOpacity={0.8}>
              <FontAwesome name="check" size={14} color={Colors.white} />
              <Text style={s.optPrimaryText}>Accept ₹50,000 offer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.optSecondary} onPress={handleRenegotiate} activeOpacity={0.8}>
              <FontAwesome name="refresh" size={13} color={Colors.primary} />
              <Text style={s.optSecondaryText}>Negotiate lower</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ACCEPT ── */}
        {gte(2) && !gte(5) && <UserBubble text="I'll accept the ₹50,000 offer" />}
        {gte(3) && !gte(5) && (
          <BotBubble>
            <Text style={s.botText}>I've drafted an acceptance:</Text>
            <View style={s.draftCard}>
              <Text style={s.draftTo}>To: settlements@bajajfinserv.in</Text>
              <Text style={s.draftSubject}>Re: Settlement Acceptance — BFL-9384021</Text>
              <View style={s.offerDivider} />
              <Text style={s.draftBody}>
                Dear Sir/Madam,{'\n\n'}I formally accept the one-time settlement offer of ₹50,000 against my outstanding personal loan of ₹86,200 (Account: BFL-9384021).{'\n\n'}I will arrange the settlement amount within 2 months from the date of this communication.{'\n\n'}I kindly request you to:{'\n'}1. Issue a formal settlement letter confirming the agreed amount{'\n'}2. Confirm the payment deadline{'\n'}3. Issue a No Objection Certificate (NOC) upon settlement{'\n\n'}Please refrain from any recovery actions during this period.{'\n\n'}Regards,{'\n'}Sunil Singh
              </Text>
            </View>
            <TouchableOpacity style={s.primaryBtn} onPress={handleSendAccept} activeOpacity={0.8}>
              <FontAwesome name="send" size={13} color={Colors.white} />
              <Text style={s.primaryBtnText}>Send to Bajaj Finserv</Text>
            </TouchableOpacity>
          </BotBubble>
        )}
        {gte(4) && !gte(5) && (
          <BotBubble>
            <View style={s.successWrap}><View style={s.successIcon}><FontAwesome name="check" size={16} color={Colors.white} /></View><Text style={s.successTitle}>Acceptance sent!</Text></View>
            <Text style={s.botText}>I've requested the formal settlement letter. They usually respond within 3-5 days. You have 2 months to arrange ₹50,000.</Text>
            <View style={s.trackerCard}>
              {['Proposed', 'Lender Offered', 'Accepted', 'Settlement Letter', 'Payment & NOC'].map((label, i) => (
                <View key={i} style={s.trackerStep}>
                  <View style={[s.trackerDot, i <= 2 && s.trackerDotDone]}>{i <= 2 && <FontAwesome name="check" size={7} color="#FFF" />}</View>
                  {i < 4 && <View style={[s.trackerLine, i <= 1 && s.trackerLineDone]} />}
                  <Text style={[s.trackerLabel, i <= 2 && s.trackerLabelDone]}>{label}</Text>
                </View>
              ))}
            </View>
          </BotBubble>
        )}

        {/* ── RENEGOTIATE ── */}
        {gte(5) && <UserBubble text="I'd like to negotiate for a lower amount" />}
        {gte(6) && (
          <BotBubble>
            <Text style={s.botText}>I'll draft a counter-proposal citing your financial hardship:</Text>
            <View style={s.draftCard}>
              <Text style={s.draftTo}>To: settlements@bajajfinserv.in</Text>
              <Text style={s.draftSubject}>Re: Counter Proposal — BFL-9384021</Text>
              <View style={s.offerDivider} />
              <Text style={s.draftBody}>
                Dear Sir/Madam,{'\n\n'}Thank you for your settlement offer of ₹50,000 against my outstanding loan of ₹86,200 (Account: BFL-9384021).{'\n\n'}I am currently experiencing severe financial hardship due to loss of employment and mounting medical expenses. The proposed amount is beyond my current means.{'\n\n'}I respectfully request a revised settlement of ₹38,000 (approximately 44% of outstanding), payable within 2 months.{'\n\n'}I am committed to resolving this amicably and request your consideration.{'\n\n'}Regards,{'\n'}Sunil Singh
              </Text>
            </View>
            <TouchableOpacity style={s.primaryBtn} onPress={handleSendCounter} activeOpacity={0.8}>
              <FontAwesome name="send" size={13} color={Colors.white} />
              <Text style={s.primaryBtnText}>Send Counter Proposal</Text>
            </TouchableOpacity>
          </BotBubble>
        )}
        {gte(7) && (
          <BotBubble>
            <View style={s.successWrap}><View style={s.successIcon}><FontAwesome name="check" size={16} color={Colors.white} /></View><Text style={s.successTitle}>Counter-proposal sent!</Text></View>
            <Text style={s.botText}>Requested ₹38,000 instead of ₹50,000. Lenders usually take 3-7 days to respond to counter-offers.</Text>
            <View style={s.insightCard}>
              <FontAwesome name="lightbulb-o" size={14} color="#D97706" />
              <Text style={s.insightText}>In our experience, they'll likely come back around ₹42,000-₹45,000 — saving you even more than the original offer.</Text>
            </View>
          </BotBubble>
        )}

        {typing && <TypingIndicator />}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.quickReplies}>
        {(gte(4) || gte(7)) && (
          <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)') }}><Text style={s.chipText}>Go home</Text></TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textMuted },
  chat: { flex: 1 },
  chatContent: { padding: 16 },
  tsWrap: { alignItems: 'center', marginBottom: 14 },
  tsText: { fontSize: 11, color: Colors.textMuted, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%' },
  userText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  botAvatarWrap: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
  botAvatarImg: { width: 30, height: 30, borderRadius: 15 },
  botBubble: { backgroundColor: '#F9FAFB', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, maxWidth: '85%', flex: 1 },
  botText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  bold: { fontWeight: '700' },
  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: 16, maxWidth: 70 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C0C0C8' },

  // Loan mini list
  loanMiniList: { marginTop: 10, gap: 6 },
  loanMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0F0F5' },
  loanMiniSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  loanMiniName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  loanMiniSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  loanMiniRec: { backgroundColor: '#F0EDFF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  loanMiniRecText: { fontSize: 9, fontWeight: '700', color: Colors.primary },

  // Offer card
  offerCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  offerCardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  offerLabel: { fontSize: 12, color: Colors.textSecondary },
  offerValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  offerDivider: { height: 1, backgroundColor: '#F0F0F5', marginVertical: 6 },

  newBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  newBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  newBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },

  optionsWrap: { gap: 8, marginBottom: 12, marginLeft: 38 },
  optPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14 },
  optPrimaryText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  optSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F0EDFF', borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#DDD8FF' },
  optSecondaryText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  draftCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  draftTo: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  draftSubject: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  draftBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14 },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  successWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  successIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#22C55E' },

  trackerCard: { flexDirection: 'row', marginTop: 12, marginBottom: 4 },
  trackerStep: { flex: 1, alignItems: 'center' },
  trackerDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  trackerDotDone: { backgroundColor: '#22C55E' },
  trackerLine: { position: 'absolute', top: 8, left: '60%', right: '-40%', height: 2, backgroundColor: '#E5E7EB' },
  trackerLineDone: { backgroundColor: '#22C55E' },
  trackerLabel: { fontSize: 8, color: Colors.textMuted, textAlign: 'center' },
  trackerLabelDone: { color: '#059669', fontWeight: '600' },

  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FEF3C7' },
  insightText: { fontSize: 12, color: '#92400E', lineHeight: 18, flex: 1 },

  quickReplies: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chip: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
})
