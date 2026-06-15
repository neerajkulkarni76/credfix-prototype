import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { useConversationStore } from '@/stores/conversationStore'
import * as Haptics from 'expo-haptics'

/* ── Shared Components ── */

function UserBubble({ text }: { text: string }) {
  return <View style={s.userRow}><View style={s.userBubble}><Text style={s.userText}>{text}</Text></View></View>
}
function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.botRow}>
      <View style={s.avWrap}><Image source={require('@/assets/risi-nav.png')} style={s.avImg} resizeMode="contain" /></View>
      <View style={s.botBubble}>{children}</View>
    </View>
  )
}
function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current]
  useEffect(() => { dots.forEach((d, i) => { Animated.loop(Animated.sequence([Animated.delay(i * 200), Animated.timing(d, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(d, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])).start() }) }, [])
  return (
    <View style={s.botRow}>
      <View style={s.avWrap}><Image source={require('@/assets/risi-nav.png')} style={s.avImg} resizeMode="contain" /></View>
      <View style={[s.botBubble, s.typingBubble]}>{dots.map((d, i) => <Animated.View key={i} style={[s.dot, { transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]} />)}</View>
    </View>
  )
}
function FileUploadAnim({ name, onDone }: { name: string; onDone: () => void }) {
  const p = useRef(new Animated.Value(0)).current
  useEffect(() => { Animated.timing(p, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: false }).start(() => onDone()) }, [])
  return (
    <View style={s.uploadCard}>
      <View style={s.uploadHeader}>
        <FontAwesome name="file-pdf-o" size={18} color="#DC2626" />
        <View style={{ flex: 1 }}><Text style={s.uploadName}>{name}</Text><Text style={s.uploadSize}>Uploading...</Text></View>
        <FontAwesome name="check-circle" size={16} color={Colors.success} />
      </View>
      <View style={s.progressTrack}><Animated.View style={[s.progressFill, { width: p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>
    </View>
  )
}

/* ── Data ── */
const LD: Record<string, { outstanding: string; num: number; account: string; email: string }> = {
  'Bajaj Finserv': { outstanding: '₹86,200', num: 86200, account: 'BFL-9384021', email: 'settlements@bajajfinserv.in' },
  'HDFC Bank': { outstanding: '₹53,200', num: 53200, account: 'XXXX-1234', email: 'legal@hdfcbank.com' },
  'Tata Capital': { outstanding: '₹41,500', num: 41500, account: 'TC-884521', email: 'recovery@tatacapital.com' },
  'Si Creva': { outstanding: '₹18,400', num: 18400, account: 'SC-772190', email: 'collections@sicreva.com' },
  'Mpokket': { outstanding: '₹7,000', num: 7000, account: 'MPK-991201', email: 'support@mpokket.com' },
}
const NT: Record<string, { type: string; section: string; desc: string; urgency: string; deadline: string; steps: string[] }> = {
  'Bajaj Finserv': { type: 'Demand Notice', section: 'Section 62 — Recovery', desc: 'A formal demand for repayment. The lender is threatening legal action if not paid within the deadline.', urgency: 'High', deadline: '15 days', steps: ['Respond within deadline citing hardship', 'Request settlement or restructuring', 'Document all communications', 'File RBI complaint if harassed'] },
  'HDFC Bank': { type: 'Sec 138 — NI Act', section: 'Section 138 — NI Act', desc: 'For a bounced cheque / ECS return. Non-response can lead to criminal proceedings, but charges are bailable and negotiable.', urgency: 'Critical', deadline: '15 days', steps: ['Respond within 15 days — legally required', 'Communicate willingness to resolve', 'Request settlement with hardship proof', 'Seek counsel if amount disputed'] },
  'Tata Capital': { type: 'Pre-Arbitration Notice', section: 'Arbitration Act, 1996', desc: 'Pre-arbitration proceedings — a step before formal legal action. Still very much negotiable.', urgency: 'Medium-High', deadline: '7 working days', steps: ['Respond before deadline to show good faith', 'Propose settlement amount', 'Request pause on recovery during negotiations', 'Keep all communications documented'] },
  'Si Creva': { type: 'Collection Reminder', section: 'General Recovery', desc: 'Standard collection reminder. No immediate legal weight, but ignoring may escalate.', urgency: 'Medium', deadline: '30 days', steps: ['Respond with payment plan', 'Request EMI restructuring', 'Keep records of communication'] },
  'Mpokket': { type: 'Payment Overdue', section: 'General Recovery', desc: 'Standard overdue reminder for short-term loan. Low legal risk but affects credit score.', urgency: 'Low', deadline: 'No strict deadline', steps: ['Clear outstanding to prevent score impact', 'Request payment extension'] },
}

const PROOF_OPTIONS = [
  { key: 'salary', label: 'Salary slips / Termination letter', icon: 'file-text-o' },
  { key: 'medical', label: 'Medical bills / Hospital records', icon: 'medkit' },
  { key: 'bank', label: 'Bank statement (last 3 months)', icon: 'bank' },
  { key: 'income', label: 'Income tax returns', icon: 'file-o' },
  { key: 'other', label: 'Other supporting documents', icon: 'paperclip' },
]

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN') }

/* ══════════════════════════════════════════ */

export default function ThreadScreen() {
  const router = useRouter()
  const { lender, type, userMsg } = useLocalSearchParams<{ lender: string; type: string; userMsg?: string }>()
  const scrollRef = useRef<ScrollView>(null)
  const { updateThreadState, getThreadState } = useConversationStore()

  const ln = lender || 'Lender'
  const it = type || 'settlement'
  const threadPath = `chat/thread?lender=${encodeURIComponent(ln)}&type=${it}`

  // Restore persisted state
  const saved = getThreadState(threadPath)
  const [step, setStepLocal] = useState(saved?.step || 0)
  const [typing, setTyping] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [legalChoice, setLegalChoiceLocal] = useState<'settlement' | 'closure' | 'time' | ''>((saved?.legalChoice as any) || '')
  const [selectedProofs, setSelectedProofsLocal] = useState<string[]>(saved?.selectedProofs || [])
  const [uploadingProofs, setUploadingProofs] = useState(false)

  // Persist step changes
  const setStep = (n: number) => { setStepLocal(n); updateThreadState(threadPath, { step: n }) }
  const setLegalChoice = (c: 'settlement' | 'closure' | 'time' | '') => { setLegalChoiceLocal(c); updateThreadState(threadPath, { legalChoice: c }) }
  const setSelectedProofs = (fn: (prev: string[]) => string[]) => {
    setSelectedProofsLocal((prev) => { const next = fn(prev); updateThreadState(threadPath, { selectedProofs: next }); return next })
  }

  const data = LD[ln] || LD['Bajaj Finserv']
  const notice = NT[ln] || NT['Bajaj Finserv']
  const est = Math.round(data.num * 0.52)
  const sav = data.num - est

  const scroll = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  const adv = (n: number, d = 1500) => { setTyping(true); scroll(); setTimeout(() => { setTyping(false); setStep(n); scroll() }, d) }

  // Only auto-advance if thread is fresh (step 0)
  useEffect(() => {
    if (saved && saved.step > 0) {
      // Restored — scroll to bottom
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200)
      return
    }
    const t = setTimeout(() => adv(1, 1800), 800)
    return () => clearTimeout(t)
  }, [])
  const gte = (n: number) => (step as number) >= n

  const toggleProof = (key: string) => setSelectedProofs((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key])

  /* Settlement */
  const sApprove = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(10); setTimeout(() => adv(11), 300) }
  const sSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(12) }

  /* Legal */
  const lUpload = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowUpload(true); scroll() }
  const lUploadDone = () => { setShowUpload(false); adv(21, 2000) }
  const lChoose = (c: 'settlement' | 'closure' | 'time') => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLegalChoice(c); setStep(22); scroll(); setTimeout(() => adv(23), 300) }
  const lProofsDone = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }
  const lProofsUploaded = () => { setUploadingProofs(false); adv(24) }
  const lSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(25) }
  // Time path: warning shown, user picks again
  const lTimeUnderstand = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(40); scroll(); setTimeout(() => adv(41), 300) }
  const lTimeSwitchSettlement = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLegalChoice('settlement'); setStep(42); scroll(); setTimeout(() => adv(43), 300) }
  const lTimeSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(44) }

  /* Harassment / Recovery */
  const gApprove = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(30); setTimeout(() => adv(31), 300) }
  const gSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(32) }

  const headerSub = it === 'settlement' ? 'Settlement' : it === 'legal' ? 'Legal Notice' : it === 'harassment' ? 'Harassment' : 'Recovery Visit'
  const userFirst = userMsg || (it === 'settlement' ? `I want to settle my ${ln} loan` : it === 'legal' ? `I received a legal notice from ${ln}` : it === 'harassment' ? `${ln} keeps calling me` : `A recovery agent from ${ln} visited me`)

  const draftForChoice = (choice: string) => {
    if (choice === 'settlement') return `Dear Sir/Madam,\n\nWith reference to the ${notice.type.toLowerCase()} regarding my account ${data.account} (outstanding: ${data.outstanding}), I wish to propose a one-time settlement of ${fmt(est)} to resolve this matter amicably.\n\nI am facing genuine financial hardship and have attached supporting documents for your consideration.\n\nI request you to:\n1. Accept the settlement proposal\n2. Withdraw any pending legal proceedings\n3. Issue a No Objection Certificate upon payment\n\nI am committed to making the payment within 2 months of acceptance.\n\nRegards,\nSunil Singh`
    if (choice === 'closure') return `Dear Sir/Madam,\n\nWith reference to the ${notice.type.toLowerCase()} regarding my account ${data.account} (outstanding: ${data.outstanding}), I wish to close this account by paying the full outstanding amount.\n\nI am facing temporary financial difficulties and request a timeline of 2 months to arrange the full payment of ${data.outstanding}.\n\nI request you to:\n1. Confirm the exact closure amount including any accrued charges\n2. Pause any legal proceedings during this period\n3. Issue a No Objection Certificate and update credit bureau records upon closure\n\nI have attached proof of my financial situation for your reference.\n\nRegards,\nSunil Singh`
    return `Dear Sir/Madam,\n\nWith reference to the ${notice.type.toLowerCase()} regarding my account ${data.account} (outstanding: ${data.outstanding}), I am writing to request additional time to arrange the repayment.\n\nI am currently facing severe financial hardship due to loss of employment and mounting expenses. I am committed to resolving this matter but need 3 months to stabilise my finances.\n\nI request you to:\n1. Grant an extension of 3 months for repayment\n2. Pause any further legal proceedings during this period\n3. Consider restructuring the repayment terms\n\nI have attached supporting documents demonstrating my current financial situation.\n\nRegards,\nSunil Singh`
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/chat/risi-hub')} style={s.backBtn}><FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} /></TouchableOpacity>
        <View style={s.hCenter}><Text style={s.hTitle}>{ln}</Text><Text style={s.hSub}>{headerSub}</Text></View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} style={s.chat} contentContainerStyle={s.chatContent} showsVerticalScrollIndicator={false}>
        <UserBubble text={userFirst} />

        {/* ══ SETTLEMENT ══ */}
        {it === 'settlement' && (<>
          {gte(1) && <BotBubble><Text style={s.bt}>I'll help you with that. Here's your {ln} account:</Text><View style={s.infoCard}><View style={s.infoRow}><Text style={s.il}>Account</Text><Text style={s.iv}>{data.account}</Text></View><View style={s.infoRow}><Text style={s.il}>Outstanding</Text><Text style={s.iv}>{data.outstanding}</Text></View></View><Text style={[s.bt, { marginTop: 10 }]}>Based on {ln}'s patterns:</Text><View style={s.offerCard}><Text style={s.offerTitle}>Settlement Estimate</Text><View style={s.offerRow}><Text style={s.ol}>Outstanding</Text><Text style={s.ov}>{data.outstanding}</Text></View><View style={s.offerRow}><Text style={s.ol}>Estimated Settlement</Text><Text style={[s.ov, { color: Colors.primary }]}>{fmt(est)}</Text></View><View style={s.divider} /><View style={s.offerRow}><Text style={[s.ol, { fontWeight: '700' }]}>Savings</Text><Text style={[s.ov, { color: '#22C55E', fontWeight: '700' }]}>{fmt(sav)}</Text></View></View><Text style={[s.bt, { marginTop: 8 }]}>Shall I send a settlement proposal?</Text></BotBubble>}
          {gte(1) && !gte(10) && !typing && <View style={s.aw}><TouchableOpacity style={s.pb} onPress={sApprove} activeOpacity={0.8}><FontAwesome name="check" size={14} color="#FFF" /><Text style={s.pbt}>Yes, send proposal</Text></TouchableOpacity></View>}
          {gte(10) && <UserBubble text="Go ahead, send the proposal" />}
          {gte(11) && <BotBubble><Text style={s.bt}>Here's the proposal:</Text><View style={s.draftCard}><Text style={s.dTo}>To: {data.email}</Text><Text style={s.dSub}>Settlement Proposal — {data.account}</Text><View style={s.divider} /><Text style={s.dBody}>Dear Sir/Madam,{'\n\n'}I propose a one-time settlement of {fmt(est)} for account {data.account} (outstanding: {data.outstanding}).{'\n\n'}I can arrange payment within 2 months of acceptance. Kindly issue an NOC upon settlement.{'\n\n'}Regards,{'\n'}Sunil Singh</Text></View><TouchableOpacity style={s.pb} onPress={sSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Send to {ln}</Text></TouchableOpacity></BotBubble>}
          {gte(12) && <BotBubble><View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Proposal sent!</Text></View><Text style={s.bt}>{ln} usually responds in 3-5 working days. I'll notify you.</Text><View style={s.trackerCard}>{['Proposal Sent', 'Bank Reviews', 'Response', 'Payment & NOC'].map((l, i) => <View key={i} style={s.ts}><View style={[s.td, i === 0 && s.tdd]}>{i === 0 && <FontAwesome name="check" size={7} color="#FFF" />}</View>{i < 3 && <View style={s.tl} />}<Text style={[s.tlb, i === 0 && s.tlbd]}>{l}</Text></View>)}</View></BotBubble>}
        </>)}

        {/* ══ LEGAL — full branching flow ══ */}
        {it === 'legal' && (<>
          {/* Ask to upload */}
          {gte(1) && <BotBubble><Text style={s.bt}>I'll help you handle this. First, I need to see the notice to understand the type and your options.</Text><Text style={[s.bt, { marginTop: 8 }]}>Please upload the legal notice from {ln}.</Text></BotBubble>}
          {gte(1) && !showUpload && !gte(21) && !typing && <View style={s.aw}><TouchableOpacity style={s.uploadBtn} onPress={lUpload} activeOpacity={0.8}><FontAwesome name="cloud-upload" size={16} color={Colors.primary} /><Text style={s.uploadBtnText}>Upload Notice (PDF / Photo)</Text></TouchableOpacity></View>}
          {showUpload && <FileUploadAnim name={`Legal_Notice_${ln.replace(/\s/g, '_')}.pdf`} onDone={lUploadDone} />}

          {/* Analysis */}
          {gte(21) && <BotBubble>
            <View style={s.badge}><FontAwesome name="search" size={10} color={Colors.primary} /><Text style={s.badgeText}>Notice Analyzed</Text></View>
            <Text style={[s.bt, { marginTop: 10, fontWeight: '600' }]}>Here's what I found:</Text>
            <View style={s.noticeCard}>
              <View style={s.infoRow}><Text style={s.il}>Notice Type</Text><Text style={s.iv}>{notice.type}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Section</Text><Text style={s.iv}>{notice.section}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Account</Text><Text style={s.iv}>{data.account}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Outstanding</Text><Text style={s.iv}>{data.outstanding}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Urgency</Text><Text style={[s.iv, notice.urgency === 'Critical' ? { color: '#DC2626' } : { color: '#EA580C' }]}>{notice.urgency}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Deadline</Text><Text style={[s.iv, { color: Colors.alert }]}>{notice.deadline}</Text></View>
            </View>
            <View style={s.explainCard}><FontAwesome name="info-circle" size={13} color={Colors.primary} /><Text style={s.explainText}>{notice.desc}</Text></View>
            <Text style={[s.bt, { marginTop: 12, fontWeight: '600' }]}>Recommended steps:</Text>
            <View style={s.stepsList}>{notice.steps.map((st, i) => <View key={i} style={s.stepItem}><View style={s.stepNum}><Text style={s.stepNumT}>{i + 1}</Text></View><Text style={s.stepT}>{st}</Text></View>)}</View>
            <Text style={[s.bt, { marginTop: 14, fontWeight: '600' }]}>How would you like to respond?</Text>
          </BotBubble>}

          {/* 3 options */}
          {gte(21) && !gte(22) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.optBtn} onPress={() => lChoose('settlement')} activeOpacity={0.8}>
                <FontAwesome name="handshake-o" size={14} color={Colors.primary} />
                <View style={{ flex: 1 }}><Text style={s.optTitle}>Request Settlement</Text><Text style={s.optDesc}>Negotiate a lower amount to close the account</Text></View>
                <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={s.optBtn} onPress={() => lChoose('closure')} activeOpacity={0.8}>
                <FontAwesome name="check-circle" size={14} color="#059669" />
                <View style={{ flex: 1 }}><Text style={s.optTitle}>Request Full Closure</Text><Text style={s.optDesc}>Pay the full amount and close the account</Text></View>
                <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={s.optBtn} onPress={() => lChoose('time')} activeOpacity={0.8}>
                <FontAwesome name="clock-o" size={14} color="#D97706" />
                <View style={{ flex: 1 }}><Text style={s.optTitle}>Request More Time</Text><Text style={s.optDesc}>Ask the lender for an extension</Text></View>
                <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* User chose settlement or closure */}
          {gte(22) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
            <UserBubble text={legalChoice === 'settlement' ? 'I want to request a settlement' : 'I want to request full closure'} />
          )}

          {/* Explain what to expect + proof picker */}
          {gte(23) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
            <BotBubble>
              <Text style={s.bt}>
                {legalChoice === 'settlement'
                  ? `With a settlement, you'll pay a reduced amount (estimated ${fmt(est)} instead of ${data.outstanding}) and the account gets closed. The lender withdraws legal proceedings and you get an NOC.`
                  : `With full closure, you pay the entire ${data.outstanding} and the account is closed completely. This gives you a "Closed" status on your credit report (better than "Settled").`}
              </Text>
              <Text style={[s.bt, { marginTop: 10, fontWeight: '600' }]}>Select the hardship proofs you'd like to attach:</Text>
              <View style={s.proofList}>
                {PROOF_OPTIONS.map((p) => {
                  const sel = selectedProofs.includes(p.key)
                  return (
                    <TouchableOpacity key={p.key} style={[s.proofItem, sel && s.proofItemSel]} onPress={() => toggleProof(p.key)} activeOpacity={0.7}>
                      <FontAwesome name={p.icon as any} size={14} color={sel ? Colors.primary : Colors.textMuted} />
                      <Text style={[s.proofText, sel && s.proofTextSel]}>{p.label}</Text>
                      <FontAwesome name={sel ? 'check-square' : 'square-o'} size={16} color={sel ? Colors.primary : '#D1D5DB'} />
                    </TouchableOpacity>
                  )
                })}
              </View>
              {selectedProofs.length > 0 && !uploadingProofs && !gte(24) && (
                <TouchableOpacity style={s.pb} onPress={lProofsDone} activeOpacity={0.8}>
                  <FontAwesome name="cloud-upload" size={14} color="#FFF" />
                  <Text style={s.pbt}>Upload {selectedProofs.length} document{selectedProofs.length > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
              {uploadingProofs && (
                <View style={{ marginTop: 10 }}>
                  {selectedProofs.map((key, i) => {
                    const p = PROOF_OPTIONS.find((o) => o.key === key)!
                    return <FileUploadAnim key={key} name={`${p.label.split('/')[0].trim()}.pdf`} onDone={i === selectedProofs.length - 1 ? lProofsUploaded : () => {}} />
                  })}
                </View>
              )}
            </BotBubble>
          )}

          {/* Draft for settlement/closure */}
          {gte(24) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
            <BotBubble>
              <Text style={s.bt}>Documents uploaded. Here's the draft response:</Text>
              <View style={s.draftCard}>
                <Text style={s.dTo}>To: {data.email}</Text>
                <Text style={s.dSub}>Re: {legalChoice === 'settlement' ? 'Settlement Request' : 'Closure Request'} — {data.account}</Text>
                <View style={s.divider} />
                <Text style={s.dBody}>{draftForChoice(legalChoice)}</Text>
              </View>
              <TouchableOpacity style={s.pb} onPress={lSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Approve & Send</Text></TouchableOpacity>
            </BotBubble>
          )}

          {/* Sent + what happens next */}
          {gte(25) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
            <BotBubble>
              <View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Response sent!</Text></View>
              <Text style={s.bt}>Your {legalChoice === 'settlement' ? 'settlement request' : 'closure request'} with hardship proofs has been sent to {ln}.</Text>
              <View style={s.trackerCard}>{['Sent', 'Bank Reviews', 'Confirmation', 'Payment & NOC'].map((l, i) => <View key={i} style={s.ts}><View style={[s.td, i === 0 && s.tdd]}>{i === 0 && <FontAwesome name="check" size={7} color="#FFF" />}</View>{i < 3 && <View style={s.tl} />}<Text style={[s.tlb, i === 0 && s.tlbd]}>{l}</Text></View>)}</View>
              <View style={s.timelineCard}>
                <Text style={s.timelineTitle}>What happens next</Text>
                <View style={s.tlItem}><View style={[s.tlDot, { backgroundColor: '#4A3AFF' }]} /><View style={{ flex: 1 }}><Text style={s.tlItemT}>Within 7 days</Text><Text style={s.tlItemD}>{ln} reviews your response and proofs</Text></View></View>
                <View style={s.tlItem}><View style={[s.tlDot, { backgroundColor: '#D97706' }]} /><View style={{ flex: 1 }}><Text style={s.tlItemT}>7–15 days</Text><Text style={s.tlItemD}>{legalChoice === 'settlement' ? 'Expect a counter-offer or acceptance' : 'Expect closure amount confirmation'}</Text></View></View>
                <View style={s.tlItem}><View style={[s.tlDot, { backgroundColor: '#22C55E' }]} /><View style={{ flex: 1 }}><Text style={s.tlItemT}>15–30 days</Text><Text style={s.tlItemD}>Finalise payment, receive NOC, credit records updated</Text></View></View>
              </View>
              <View style={s.insightCard}><FontAwesome name="lightbulb-o" size={14} color="#D97706" /><Text style={s.insightText}>I'll monitor for their response and notify you immediately. Most banks prefer {legalChoice === 'settlement' ? 'settlement' : 'closure'} over prolonged legal proceedings.</Text></View>
            </BotBubble>
          )}

          {/* ── TIME PATH ── */}
          {gte(22) && legalChoice === 'time' && !gte(40) && (
            <UserBubble text="I need more time to arrange the payment" />
          )}
          {gte(23) && legalChoice === 'time' && !gte(40) && (
            <BotBubble>
              <View style={s.warningCard}><FontAwesome name="exclamation-triangle" size={14} color="#DC2626" /><Text style={s.warningText}>Important: The lender is not obligated to grant an extension. They may still proceed with legal action even if you request more time. The notice deadline ({notice.deadline}) remains enforceable.</Text></View>
              <Text style={[s.bt, { marginTop: 10 }]}>I'd recommend requesting a settlement instead — it resolves the matter faster and removes legal risk. But if you still want more time, I can draft that request too.</Text>
              <Text style={[s.bt, { marginTop: 8, fontWeight: '600' }]}>What would you prefer?</Text>
            </BotBubble>
          )}
          {gte(23) && legalChoice === 'time' && !gte(40) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.optBtn} onPress={lTimeSwitchSettlement} activeOpacity={0.8}>
                <FontAwesome name="handshake-o" size={14} color={Colors.primary} />
                <View style={{ flex: 1 }}><Text style={s.optTitle}>Request Settlement Instead</Text><Text style={s.optDesc}>Better outcome — resolves legal risk</Text></View>
              </TouchableOpacity>
              <TouchableOpacity style={s.optBtn} onPress={lTimeUnderstand} activeOpacity={0.8}>
                <FontAwesome name="clock-o" size={14} color="#D97706" />
                <View style={{ flex: 1 }}><Text style={s.optTitle}>I understand, request more time</Text><Text style={s.optDesc}>Draft extension request with hardship proof</Text></View>
              </TouchableOpacity>
            </View>
          )}

          {/* Time: user insists → proof picker + draft + send */}
          {gte(40) && legalChoice === 'time' && <UserBubble text="I understand the risk, please request more time" />}
          {gte(41) && legalChoice === 'time' && (
            <BotBubble>
              <Text style={s.bt}>I'll draft the extension request. First, select the hardship proofs to attach:</Text>
              <View style={s.proofList}>
                {PROOF_OPTIONS.map((p) => {
                  const sel = selectedProofs.includes(p.key)
                  return (
                    <TouchableOpacity key={p.key} style={[s.proofItem, sel && s.proofItemSel]} onPress={() => toggleProof(p.key)} activeOpacity={0.7}>
                      <FontAwesome name={p.icon as any} size={14} color={sel ? Colors.primary : Colors.textMuted} />
                      <Text style={[s.proofText, sel && s.proofTextSel]}>{p.label}</Text>
                      <FontAwesome name={sel ? 'check-square' : 'square-o'} size={16} color={sel ? Colors.primary : '#D1D5DB'} />
                    </TouchableOpacity>
                  )
                })}
              </View>
              {selectedProofs.length > 0 && !uploadingProofs && !gte(42) && (
                <TouchableOpacity style={s.pb} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }} activeOpacity={0.8}>
                  <FontAwesome name="cloud-upload" size={14} color="#FFF" />
                  <Text style={s.pbt}>Upload {selectedProofs.length} document{selectedProofs.length > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
              {uploadingProofs && !gte(42) && (
                <View style={{ marginTop: 10 }}>
                  {selectedProofs.map((key, i) => {
                    const p = PROOF_OPTIONS.find((o) => o.key === key)!
                    return <FileUploadAnim key={key} name={`${p.label.split('/')[0].trim()}.pdf`} onDone={i === selectedProofs.length - 1 ? () => { setUploadingProofs(false); adv(42) } : () => {}} />
                  })}
                </View>
              )}
            </BotBubble>
          )}
          {gte(42) && legalChoice === 'time' && (
            <BotBubble>
              <Text style={s.bt}>Here's the extension request:</Text>
              <View style={s.draftCard}>
                <Text style={s.dTo}>To: {data.email}</Text>
                <Text style={s.dSub}>Re: Request for Extension — {data.account}</Text>
                <View style={s.divider} />
                <Text style={s.dBody}>{draftForChoice('time')}</Text>
              </View>
              <TouchableOpacity style={s.pb} onPress={lTimeSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Approve & Send</Text></TouchableOpacity>
            </BotBubble>
          )}
          {gte(44) && legalChoice === 'time' && (
            <BotBubble>
              <View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Request sent!</Text></View>
              <Text style={s.bt}>Your extension request has been sent to {ln} with hardship documentation.</Text>
              <View style={s.insightCard}><FontAwesome name="lightbulb-o" size={14} color="#D97706" /><Text style={s.insightText}>If the lender doesn't grant the extension, I'll immediately help you explore settlement options. I'll keep you updated on their response.</Text></View>
            </BotBubble>
          )}

          {/* Time → switched to settlement */}
          {gte(42) && legalChoice === 'settlement' && (step as number) >= 42 && (step as number) < 44 && (
            <>
              <UserBubble text="Let me request a settlement instead" />
              {gte(43) && <BotBubble>
                <Text style={s.bt}>Smart choice. Here's the settlement request:</Text>
                <View style={s.draftCard}>
                  <Text style={s.dTo}>To: {data.email}</Text>
                  <Text style={s.dSub}>Re: Settlement Request — {data.account}</Text>
                  <View style={s.divider} />
                  <Text style={s.dBody}>{draftForChoice('settlement')}</Text>
                </View>
                <TouchableOpacity style={s.pb} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(25) }} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Approve & Send</Text></TouchableOpacity>
              </BotBubble>}
            </>
          )}
        </>)}

        {/* ══ HARASSMENT / RECOVERY ══ */}
        {(it === 'harassment' || it === 'recovery') && (<>
          {gte(1) && <BotBubble><Text style={s.bt}>Here's your {ln} account:</Text><View style={s.infoCard}><View style={s.infoRow}><Text style={s.il}>Account</Text><Text style={s.iv}>{data.account}</Text></View><View style={s.infoRow}><Text style={s.il}>Outstanding</Text><Text style={s.iv}>{data.outstanding}</Text></View></View>{it === 'harassment' ? <Text style={[s.bt, { marginTop: 10 }]}>Harassment calls violate RBI's Fair Practices Code. I can file a complaint and activate Neytra to handle future calls.{'\n\n'}Shall I draft a formal complaint?</Text> : <Text style={[s.bt, { marginTop: 10 }]}>Recovery agents must follow RBI guidelines — no visits before 7AM/after 7PM, no threats, no contacting neighbours.{'\n\n'}Shall I draft a complaint?</Text>}</BotBubble>}
          {gte(1) && !gte(30) && !typing && <View style={s.aw}><TouchableOpacity style={s.pb} onPress={gApprove} activeOpacity={0.8}><FontAwesome name="check" size={14} color="#FFF" /><Text style={s.pbt}>Yes, draft complaint</Text></TouchableOpacity></View>}
          {gte(30) && <UserBubble text="Yes, draft the complaint" />}
          {gte(31) && <BotBubble><Text style={s.bt}>Here's the complaint:</Text><View style={s.draftCard}><Text style={s.dTo}>To: {data.email}</Text><Text style={s.dSub}>Formal Complaint — RBI Violation — {data.account}</Text><View style={s.divider} /><Text style={s.dBody}>Dear Sir/Madam,{'\n\n'}I formally complain that your {it === 'harassment' ? 'agents have been making harassing calls' : 'recovery agent conducted an inappropriate visit'} regarding account {data.account}, violating the RBI Fair Practices Code.{'\n\n'}I demand immediate cessation. Continued violations will be reported to the Banking Ombudsman.{'\n\n'}Regards,{'\n'}Sunil Singh</Text></View><TouchableOpacity style={s.pb} onPress={gSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Send to {ln}</Text></TouchableOpacity></BotBubble>}
          {gte(32) && <BotBubble><View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Complaint filed!</Text></View><Text style={s.bt}>If the issue persists, I can escalate to the Banking Ombudsman.</Text></BotBubble>}
        </>)}

        {typing && <TypingIndicator />}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.qr}>
        {(gte(12) || gte(25) || gte(32) || gte(44)) && <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)') }}><Text style={s.chipText}>Go home</Text></TouchableOpacity>}
      </View>
    </SafeAreaView>
  )
}

/* ── Styles ── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  hCenter: { alignItems: 'center' }, hTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary }, hSub: { fontSize: 11, color: Colors.textMuted },
  chat: { flex: 1 }, chatContent: { padding: 16 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%' },
  userText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  avWrap: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' }, avImg: { width: 30, height: 30, borderRadius: 15 },
  botBubble: { backgroundColor: '#F9FAFB', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, flex: 1 },
  bt: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: 16, maxWidth: 70 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C0C0C8' },
  infoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  il: { fontSize: 12, color: Colors.textSecondary }, iv: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  offerCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  offerTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ol: { fontSize: 12, color: Colors.textSecondary }, ov: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: '#F0F0F5', marginVertical: 6 },
  aw: { marginLeft: 38, marginBottom: 12 },
  pb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14 },
  pbt: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  // Upload
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F0EDFF', borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: '#DDD8FF' },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  uploadCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, marginLeft: 38, borderWidth: 1, borderColor: '#F0F0F5' },
  uploadHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  uploadName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary }, uploadSize: { fontSize: 10, color: Colors.textMuted },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }, progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.primary },
  // Analysis
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0EDFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  noticeCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#FECACA' },
  explainCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#F0EDFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#DDD8FF' },
  explainText: { fontSize: 12, color: '#4A3AFF', lineHeight: 18, flex: 1 },
  stepsList: { marginTop: 8, gap: 6 }, stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  stepNumT: { fontSize: 10, fontWeight: '700', color: Colors.primary }, stepT: { fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  // Options
  optBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#E5E7EB' },
  optTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary }, optDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  // Proof picker
  proofList: { marginTop: 10, gap: 6 },
  proofItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  proofItemSel: { borderColor: Colors.primary, backgroundColor: '#FAFAFF' },
  proofText: { flex: 1, fontSize: 12, color: Colors.textSecondary }, proofTextSel: { color: Colors.textPrimary, fontWeight: '500' },
  // Draft
  draftCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  dTo: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 }, dSub: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }, dBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  // Success
  sw: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  si: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  st: { fontSize: 16, fontWeight: '700', color: '#22C55E' },
  // Tracker
  trackerCard: { flexDirection: 'row', marginTop: 12, marginBottom: 4 },
  ts: { flex: 1, alignItems: 'center' }, td: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  tdd: { backgroundColor: '#22C55E' }, tl: { position: 'absolute', top: 8, left: '60%', right: '-40%', height: 2, backgroundColor: '#E5E7EB' },
  tlb: { fontSize: 8, color: Colors.textMuted, textAlign: 'center' }, tlbd: { color: '#059669', fontWeight: '600' },
  // Timeline
  timelineCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#F0F0F5' },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  tlItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tlDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  tlItemT: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary }, tlItemD: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, marginTop: 1 },
  // Insight / Warning
  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FEF3C7' },
  insightText: { fontSize: 12, color: '#92400E', lineHeight: 18, flex: 1 },
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FECACA' },
  warningText: { fontSize: 12, color: '#991B1B', lineHeight: 18, flex: 1 },
  // Bottom
  qr: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chip: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  uploadInfo: { flex: 1 },
})
