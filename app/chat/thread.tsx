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

const VISIT_ISSUES = [
  { key: 'timing', label: 'Visited before 7 AM or after 7 PM', icon: 'clock-o' },
  { key: 'threats', label: 'Used threats or intimidating language', icon: 'warning' },
  { key: 'abuse', label: 'Verbally abused me or my family', icon: 'exclamation-circle' },
  { key: 'neighbours', label: 'Spoke to my neighbours about the loan', icon: 'users' },
  { key: 'employer', label: 'Contacted my workplace or employer', icon: 'building' },
  { key: 'no_id', label: 'Did not carry proper identification', icon: 'id-card-o' },
  { key: 'damage', label: 'Damaged property or created a scene', icon: 'bolt' },
  { key: 'multiple', label: 'Visited multiple times without notice', icon: 'refresh' },
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

  /* Settlement + Closure — shared extended flow */
  const [isPremium, setIsPremium] = useState(false)
  const sWatchedVideo = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(3); setTimeout(() => adv(4), 300) }
  const sAcknowledge = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(4.5 as any); setTimeout(() => { isPremium ? adv(6) : adv(5) }, 300) }
  const sCompletePay = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsPremium(true); setStep(5.5 as any); setTimeout(() => adv(6), 300) }
  const sApprove = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(7); scroll(); setTimeout(() => adv(8), 300) }
  const sProofsDone = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }
  const sProofsUploaded = () => { setUploadingProofs(false); adv(9) }
  const sSkipProofs = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(7.5 as any); setTimeout(() => adv(9), 300) }
  const sSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(12) }

  /* Legal — extended: loan picker (step 1) → upload (step 20) → premium (step 21) → analysis (step 22) → response options → ... */
  const lUpload = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowUpload(true); scroll() }
  const lUploadDone = () => { setShowUpload(false); isPremium ? adv(22, 2000) : adv(21, 2000) }
  const lCompletePay = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsPremium(true); setStep(21.5 as any); setTimeout(() => adv(22), 300) }
  const lChoose = (c: 'settlement' | 'closure' | 'time') => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLegalChoice(c); setStep(23); scroll(); setTimeout(() => adv(24), 300) }
  const lProofsDone = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }
  const lProofsUploaded = () => { setUploadingProofs(false); adv(25) }
  const lSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(26) }
  const lTimeUnderstand = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(40); scroll(); setTimeout(() => adv(41), 300) }
  const lTimeSwitchSettlement = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLegalChoice('settlement'); setStep(42); scroll(); setTimeout(() => adv(43), 300) }
  const lTimeSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(44) }

  /* Harassment / Recovery — extended: intro + video (step 1) → intent (step 30) → premium (step 31) → activate neytra */
  const hWatchedVideo = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(30); setTimeout(() => adv(31), 300) }
  const hCompletePay = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsPremium(true); setStep(31.5 as any); setTimeout(() => adv(32), 300) }
  const hActivateNeytra = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push('/neytra-screens/activate') }

  /* Recovery — lender(1) → rights+video(50) → want stop?(50.5) → premium(51) → issues(52) → proof(53) → draft(54) → send(55) */
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const toggleIssue = (key: string) => setSelectedIssues((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key])
  const rWantStop = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(50.5 as any); setTimeout(() => { isPremium ? adv(52) : adv(51) }, 300) }
  const rCompletePay = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsPremium(true); setStep(51.5 as any); setTimeout(() => adv(52), 300) }
  const rSelectIssues = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(52.5 as any); scroll(); setTimeout(() => adv(53), 300) }
  const rProofsDone = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }
  const rProofsUploaded = () => { setUploadingProofs(false); adv(54) }
  const rSkipProofs = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(53.5 as any); setTimeout(() => adv(54), 300) }
  const rSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(55) }

  const headerSub = it === 'settlement' ? 'Settlement' : it === 'closure' ? 'Loan Closure' : it === 'legal' ? 'Legal Notice' : it === 'harassment' ? 'Harassment' : 'Recovery Visit'
  const userFirst = userMsg || (it === 'settlement' ? `I want to settle my ${ln} loan` : it === 'closure' ? `I want to close my ${ln} loan` : it === 'legal' ? `I received a legal notice from ${ln}` : it === 'harassment' ? `${ln} keeps calling me` : `A recovery agent from ${ln} visited me`)

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

        {/* ══ SETTLEMENT / CLOSURE — extended flow ══ */}
        {(it === 'settlement' || it === 'closure') && (<>

          {/* Step 1: Risi asks to select loan */}
          {gte(1) && <BotBubble>
            <Text style={s.bt}>
              {it === 'closure'
                ? "I understand you want to close a loan completely. That's a great decision — let me help you through this."
                : "I understand you want to settle a loan. I'm here to help you through this — one step at a time."}
            </Text>
            <Text style={[s.bt, { marginTop: 8 }]}>
              {it === 'closure'
                ? <>Which loan would you like to close? Only <Text style={{ fontWeight: '700', color: Colors.primary }}>unsecured open loans</Text> are eligible.</>
                : <>Which loan would you like to settle? Only <Text style={{ fontWeight: '700', color: Colors.primary }}>unsecured open loans</Text> are eligible for settlement.</>}
            </Text>
            <View style={s.loanPicker}>
              {Object.entries(LD).map(([name, d]) => (
                <TouchableOpacity key={name} style={[s.loanPickItem, name === ln && s.loanPickItemSel]} activeOpacity={0.7} onPress={() => { if (name === ln) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(1.5 as any); setTimeout(() => adv(2), 300) } }}>
                  <View style={s.loanPickIcon}><FontAwesome name="university" size={13} color={name === ln ? Colors.primary : Colors.textMuted} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.loanPickName, name === ln && { color: Colors.primary }]}>{name}</Text>
                    <Text style={s.loanPickSub}>{d.outstanding} outstanding</Text>
                  </View>
                  <FontAwesome name="chevron-right" size={10} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 6 }}>Secured loans (home, car) follow a different process</Text>
          </BotBubble>}

          {/* User selected loan */}
          {gte(1.5 as any) && <UserBubble text={`I want to settle my ${ln} loan`} />}

          {/* Step 2: Video placeholder + understanding settlement */}
          {gte(2) && <BotBubble>
            <Text style={s.bt}>
              {it === 'closure'
                ? "Before we begin, it's important you understand how loan closure works and what to expect. Please watch this short explainer:"
                : "Before we begin, it's important you understand how settlement works. Please watch this short explainer:"}
            </Text>
            <View style={s.videoCard}>
              <View style={s.videoThumb}>
                <View style={s.videoPlayBtn}><FontAwesome name="play" size={20} color="#FFF" /></View>
              </View>
              <Text style={s.videoTitle}>{it === 'closure' ? 'How Loan Closure Works' : 'How Loan Settlement Works'}</Text>
              <Text style={s.videoDesc}>{it === 'closure' ? '2 min · Full closure process, charges waiver, and NOC' : '2 min · What is settlement, how it affects your credit, and what to expect'}</Text>
            </View>
          </BotBubble>}

          {/* CTA after video */}
          {gte(2) && !gte(3) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.pb} onPress={sWatchedVideo} activeOpacity={0.8}>
                <FontAwesome name="play-circle" size={14} color="#FFF" />
                <Text style={s.pbt}>I've watched the video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* User watched */}
          {gte(3) && <UserBubble text="I've watched the video" />}

          {/* Step 4: Acknowledgement */}
          {gte(4) && <BotBubble>
            <Text style={s.bt}>Great! Just to make sure we're on the same page:</Text>
            <View style={s.ackCard}>
              {it === 'closure' ? (<>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>Loan closure means paying the full outstanding (after waiver of charges) to close the account</Text></View>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>Your credit report will show "Closed" — the best possible status for future loans</Text></View>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>We will request {ln} to waive maximum possible penal and interest charges</Text></View>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>You will receive an NOC (No Objection Certificate) upon payment</Text></View>
              </>) : (<>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>Settlement means paying a reduced lump-sum amount to close the loan</Text></View>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>Your credit report will show "Settled" (not "Closed") for this account</Text></View>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>We will negotiate the best possible offer with {ln} on your behalf</Text></View>
                <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color={Colors.primary} /><Text style={s.ackText}>You are not obligated to accept any offer — the final decision is always yours</Text></View>
              </>)}
            </View>
            <Text style={[s.bt, { marginTop: 8 }]}>Do you understand and wish to proceed?</Text>
          </BotBubble>}

          {gte(4) && !gte(4.5 as any) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.pb} onPress={sAcknowledge} activeOpacity={0.8}>
                <FontAwesome name="check" size={14} color="#FFF" />
                <Text style={s.pbt}>Yes, I understand. Let's proceed</Text>
              </TouchableOpacity>
            </View>
          )}

          {gte(4.5 as any) && <UserBubble text="Yes, I understand. Let's proceed" />}

          {/* Step 5: Subscription check — show if not premium */}
          {gte(5) && !isPremium && <BotBubble>
            <Text style={s.bt}>To get the best settlement outcome, you'll need <Text style={{ fontWeight: '700', color: Colors.primary }}>Credfix Premium</Text>. This unlocks everything you need to resolve your loans:</Text>
            <View style={s.premiumCard}>
              <View style={s.premiumHeader}>
                <Text style={s.premiumTitle}>Credfix Premium</Text>
                <View style={s.premiumPricePill}><Text style={s.premiumPrice}>₹499/mo</Text></View>
              </View>
              <View style={s.premiumFeature}><FontAwesome name="shield" size={12} color="#059669" /><Text style={s.premiumFeatText}>Neytra Call Management — AI answers & records all recovery calls</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="gavel" size={12} color="#DC2626" /><Text style={s.premiumFeatText}>Legal Notice Response — Expert-drafted replies with hardship documentation</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="handshake-o" size={12} color={Colors.primary} /><Text style={s.premiumFeatText}>Expert-led Settlement — Dedicated negotiation with lenders for best offers</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="comments" size={12} color="#7C3AED" /><Text style={s.premiumFeatText}>Unlimited Risi Access — 24/7 AI assistance for all your loan queries</Text></View>
            </View>
          </BotBubble>}

          {gte(5) && !isPremium && !gte(5.5 as any) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.premiumBtn} onPress={sCompletePay} activeOpacity={0.8}>
                <FontAwesome name="lock" size={13} color="#FFF" />
                <Text style={s.premiumBtnText}>Subscribe & Continue — ₹499/mo</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 6 }}>Cancel anytime · No lock-in · Refund within 7 days</Text>
            </View>
          )}

          {/* Payment done */}
          {gte(5.5 as any) && <UserBubble text="Payment completed" />}

          {/* Step 6: Thank you + estimate (DPD based) */}
          {gte(6) && <BotBubble>
            <View style={s.sw}><View style={[s.si, { backgroundColor: Colors.primary }]}><FontAwesome name="star" size={14} color="#FFF" /></View><Text style={[s.st, { color: Colors.primary }]}>Welcome to Credfix Premium!</Text></View>
            <Text style={s.bt}>Thank you for subscribing. You now have full access to expert-led settlement support, Neytra call protection, and unlimited Risi assistance.</Text>
            <Text style={[s.bt, { marginTop: 10 }]}>Let me pull up your {ln} account and prepare a settlement estimate for you.</Text>
          </BotBubble>}

          {/* Step 6 continued: show estimate based on DPD */}
          {gte(6) && <BotBubble>
            <Text style={s.bt}>Here's your {ln} account:</Text>
            <View style={s.infoCard}>
              <View style={s.infoRow}><Text style={s.il}>Account</Text><Text style={s.iv}>{data.account}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Outstanding</Text><Text style={s.iv}>{data.outstanding}</Text></View>
              <View style={s.infoRow}><Text style={s.il}>Delay</Text><Text style={[s.iv, { color: Colors.alert }]}>{data.num > 50000 ? '9+ months' : data.num > 30000 ? '3-6 months' : '1-3 months'}</Text></View>
            </View>

            {it === 'closure' ? (<>
              <Text style={[s.bt, { marginTop: 10 }]}>For loan closure, I'll request {ln} to share the exact payable amount after waiving penal and interest charges:</Text>
              <View style={s.offerCard}>
                <Text style={s.offerTitle}>Closure Estimate</Text>
                <View style={s.offerRow}><Text style={s.ol}>Outstanding</Text><Text style={s.ov}>{data.outstanding}</Text></View>
                <View style={s.offerRow}><Text style={s.ol}>Estimated Penal Charges</Text><Text style={s.ov}>{fmt(Math.round(data.num * 0.15))}</Text></View>
                <View style={s.offerRow}><Text style={s.ol}>Waiver Request</Text><Text style={[s.ov, { color: '#22C55E' }]}>Maximum possible</Text></View>
                <View style={s.divider} />
                <View style={s.offerRow}><Text style={[s.ol, { fontWeight: '700' }]}>Expected Closure</Text><Text style={[s.ov, { color: Colors.primary, fontWeight: '700' }]}>{data.outstanding} – {fmt(Math.round(data.num * 1.05))}</Text></View>
              </View>
              <Text style={[s.bt, { marginTop: 8 }]}>The final amount will depend on how much {ln} agrees to waive. Shall I send the closure request?</Text>
            </>) : (<>
              <Text style={[s.bt, { marginTop: 10 }]}>Based on {ln}'s recent settlement patterns and your account status:</Text>
              <View style={s.offerCard}>
                <Text style={s.offerTitle}>Settlement Estimate</Text>
                <View style={s.offerRow}><Text style={s.ol}>Outstanding</Text><Text style={s.ov}>{data.outstanding}</Text></View>
                <View style={s.offerRow}><Text style={s.ol}>Estimated Settlement</Text><Text style={[s.ov, { color: Colors.primary }]}>{fmt(est)}</Text></View>
                <View style={s.divider} />
                <View style={s.offerRow}><Text style={[s.ol, { fontWeight: '700' }]}>Potential Savings</Text><Text style={[s.ov, { color: '#22C55E', fontWeight: '700' }]}>{fmt(sav)}</Text></View>
              </View>
              <Text style={[s.bt, { marginTop: 8 }]}>This is our best estimate. The actual offer from {ln} may vary. Shall I initiate the settlement proposal?</Text>
            </>)}

            <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}>
              <FontAwesome name="headphones" size={12} color={Colors.primary} />
              <Text style={s.expertBtnText}>Talk to expert</Text>
            </TouchableOpacity>
          </BotBubble>}

          {/* Approve — initiate proposal */}
          {gte(6) && !gte(7) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.pb} onPress={sApprove} activeOpacity={0.8}>
                <FontAwesome name="check" size={14} color="#FFF" />
                <Text style={s.pbt}>{it === 'closure' ? 'Yes, request closure quote' : 'Yes, initiate settlement'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {gte(7) && <UserBubble text={it === 'closure' ? 'Yes, request closure quote' : 'Yes, initiate settlement'} />}

          {/* Step 8: Hardship proof upload (settlement) / Waiver justification (closure) */}
          {gte(8) && <BotBubble>
            <Text style={s.bt}>
              {it === 'closure'
                ? `To request maximum waiver on penal and interest charges, it helps to share proof of your financial situation. This strengthens your case for a better closure offer.`
                : `Before I send the proposal, sharing proof of financial hardship can significantly improve the settlement offer you receive. Lenders are more flexible when they see genuine documentation.`}
            </Text>
            <Text style={[s.bt, { marginTop: 8, fontWeight: '600' }]}>Select documents you can share:</Text>
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
            {selectedProofs.length > 0 && !uploadingProofs && !gte(9) && (
              <TouchableOpacity style={s.pb} onPress={sProofsDone} activeOpacity={0.8}>
                <FontAwesome name="cloud-upload" size={14} color="#FFF" />
                <Text style={s.pbt}>Upload {selectedProofs.length} document{selectedProofs.length > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
            {uploadingProofs && !gte(9) && (
              <View style={{ marginTop: 10 }}>
                {selectedProofs.map((key, i) => {
                  const p = PROOF_OPTIONS.find((o) => o.key === key)!
                  return <FileUploadAnim key={key} name={`${p.label.split('/')[0].trim()}.pdf`} onDone={i === selectedProofs.length - 1 ? sProofsUploaded : () => {}} />
                })}
              </View>
            )}
            {!uploadingProofs && !gte(9) && (
              <TouchableOpacity style={s.skipProofBtn} onPress={sSkipProofs} activeOpacity={0.7}>
                <Text style={s.skipProofText}>I don't have proof right now → Continue without</Text>
              </TouchableOpacity>
            )}
          </BotBubble>}

          {/* User skipped proofs */}
          {gte(7.5 as any) && !selectedProofs.length && <UserBubble text="Continue without proof for now" />}

          {/* Step 9: Draft email */}
          {gte(9) && <BotBubble>
            <Text style={s.bt}>
              {it === 'closure'
                ? `I've prepared a closure request for ${ln}. This includes a request to waive all penal and interest charges:`
                : `${selectedProofs.length > 0 ? 'Documents uploaded. ' : ''}I've prepared the settlement proposal for ${ln}:`}
            </Text>
            <View style={s.draftCard}>
              <Text style={s.dTo}>To: {data.email}</Text>
              <Text style={s.dSub}>{it === 'closure' ? `Loan Closure Request — ${data.account}` : `Settlement Proposal — ${data.account}`}</Text>
              <View style={s.divider} />
              <Text style={s.dBody}>
                {it === 'closure'
                  ? `Dear Sir/Madam,\n\nI am writing to request the full and final closure of my account ${data.account} with an outstanding balance of ${data.outstanding}.\n\nI am committed to clearing this account and request you to:\n1. Provide the exact closure amount payable\n2. Waive all penal charges and accrued interest to the extent possible\n3. Issue a No Objection Certificate (NOC) upon payment\n4. Update my credit bureau records to reflect "Closed" status\n\n${selectedProofs.length > 0 ? 'I have attached proof of my current financial situation for your consideration in waiving the charges.\n\n' : ''}I request your earliest response so I can arrange the payment.\n\nRegards,\nSunil Singh`
                  : `Dear Sir/Madam,\n\nI am writing to propose a one-time settlement of ${fmt(est)} for my account ${data.account} with an outstanding balance of ${data.outstanding}.\n\nI am facing genuine financial hardship and am committed to resolving this matter amicably. I can arrange payment within 2 months of acceptance.\n\n${selectedProofs.length > 0 ? 'I have attached supporting documents as proof of my financial situation.\n\n' : ''}I request you to kindly consider this proposal and issue a No Objection Certificate (NOC) upon settlement.\n\nRegards,\nSunil Singh`}
              </Text>
            </View>
            <TouchableOpacity style={s.pb} onPress={sSend} activeOpacity={0.8}>
              <FontAwesome name="send" size={13} color="#FFF" />
              <Text style={s.pbt}>Send to {ln}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}>
              <FontAwesome name="headphones" size={12} color={Colors.primary} />
              <Text style={s.expertBtnText}>Talk to expert</Text>
            </TouchableOpacity>
          </BotBubble>}

          {/* Step 12: Success */}
          {gte(12) && <BotBubble>
            <View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>{it === 'closure' ? 'Closure request sent!' : 'Proposal sent!'}</Text></View>
            <Text style={s.bt}>
              {it === 'closure'
                ? `Your closure request has been sent to ${ln}. They'll share the final closure amount (after waiver of charges) within 3-5 working days. I'll notify you the moment they respond.`
                : `Your settlement proposal has been sent to ${ln}. They usually respond within 3-5 working days. I'll notify you the moment they reply.`}
            </Text>
            <View style={s.trackerCard}>
              {(it === 'closure'
                ? ['Request Sent', 'Bank Reviews', 'Closure Amount', 'Payment & NOC']
                : ['Proposal Sent', 'Bank Reviews', 'Response', 'Payment & NOC']
              ).map((l, i) => (
                <View key={i} style={s.ts}><View style={[s.td, i === 0 && s.tdd]}>{i === 0 && <FontAwesome name="check" size={7} color="#FFF" />}</View>{i < 3 && <View style={s.tl} />}<Text style={[s.tlb, i === 0 && s.tlbd]}>{l}</Text></View>
              ))}
            </View>
            <View style={s.insightCard}>
              <FontAwesome name="lightbulb-o" size={14} color="#D97706" />
              <Text style={s.insightText}>
                {it === 'closure'
                  ? `Once ${ln} shares the closure amount, you'll have the option to accept or negotiate further. Start saving in your Loan Closure Fund in the meantime.`
                  : `While we wait for ${ln}'s response, you can start saving towards the settlement amount in your Loan Closure Fund. Every bit helps.`}
              </Text>
            </View>
            <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}>
              <FontAwesome name="headphones" size={12} color={Colors.primary} />
              <Text style={s.expertBtnText}>Talk to expert</Text>
            </TouchableOpacity>
          </BotBubble>}
        </>)}

        {/* ══ LEGAL — extended flow ══ */}
        {it === 'legal' && (<>

          {/* Step 1: Loan picker */}
          {gte(1) && <BotBubble>
            <Text style={s.bt}>I'm sorry you're dealing with this. Let me help you respond properly and protect your rights.</Text>
            <Text style={[s.bt, { marginTop: 8 }]}>Which lender sent you the legal notice?</Text>
            <View style={s.loanPicker}>
              {Object.entries(LD).map(([name, d]) => (
                <TouchableOpacity key={name} style={[s.loanPickItem, name === ln && s.loanPickItemSel]} activeOpacity={0.7} onPress={() => { if (name === ln) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(1.5 as any); setTimeout(() => adv(20), 300) } }}>
                  <View style={s.loanPickIcon}><FontAwesome name="university" size={13} color={name === ln ? Colors.primary : Colors.textMuted} /></View>
                  <View style={{ flex: 1 }}><Text style={[s.loanPickName, name === ln && { color: Colors.primary }]}>{name}</Text><Text style={s.loanPickSub}>{d.outstanding} outstanding</Text></View>
                  <FontAwesome name="chevron-right" size={10} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </BotBubble>}

          {gte(1.5 as any) && <UserBubble text={`I received a notice from ${ln}`} />}

          {/* Step 20: Upload notice */}
          {gte(20) && <BotBubble>
            <Text style={s.bt}>To understand the type of notice and your best options, I need to see the document. Please upload it:</Text>
          </BotBubble>}

          {gte(20) && !showUpload && !gte(21) && !typing && <View style={s.aw}><TouchableOpacity style={s.uploadBtn} onPress={lUpload} activeOpacity={0.8}><FontAwesome name="cloud-upload" size={16} color={Colors.primary} /><Text style={s.uploadBtnText}>Upload Notice (PDF / Photo)</Text></TouchableOpacity></View>}
          {showUpload && <FileUploadAnim name={`Legal_Notice_${ln.replace(/\s/g, '_')}.pdf`} onDone={lUploadDone} />}

          {/* Uploaded notice preview */}
          {gte(21) && (
            <View style={s.uploadedCard}>
              <View style={s.uploadedIcon}><FontAwesome name="file-pdf-o" size={22} color="#DC2626" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.uploadedName}>Legal_Notice_{ln.replace(/\s/g, '_')}.pdf</Text>
                <Text style={s.uploadedStatus}>Uploaded successfully</Text>
              </View>
              <FontAwesome name="check-circle" size={18} color="#22C55E" />
            </View>
          )}

          {/* Step 21: Premium subscription — if not premium */}
          {gte(21) && !isPremium && <BotBubble>
            <Text style={s.bt}>I've received the notice. To provide you with expert legal analysis and draft a response, you'll need <Text style={{ fontWeight: '700', color: Colors.primary }}>Credfix Premium</Text>:</Text>
            <View style={s.premiumCard}>
              <View style={s.premiumHeader}><Text style={s.premiumTitle}>Credfix Premium</Text><View style={s.premiumPricePill}><Text style={s.premiumPrice}>₹499/mo</Text></View></View>
              <View style={s.premiumFeature}><FontAwesome name="shield" size={12} color="#059669" /><Text style={s.premiumFeatText}>Neytra Call Management — AI answers & records all recovery calls</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="gavel" size={12} color="#DC2626" /><Text style={s.premiumFeatText}>Legal Notice Response — Expert-drafted replies with hardship documentation</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="handshake-o" size={12} color={Colors.primary} /><Text style={s.premiumFeatText}>Expert-led Settlement — Dedicated negotiation with lenders for best offers</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="comments" size={12} color="#7C3AED" /><Text style={s.premiumFeatText}>Unlimited Risi Access — 24/7 AI assistance for all your loan queries</Text></View>
            </View>
          </BotBubble>}

          {gte(21) && !isPremium && !gte(21.5 as any) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.premiumBtn} onPress={lCompletePay} activeOpacity={0.8}>
                <FontAwesome name="lock" size={13} color="#FFF" />
                <Text style={s.premiumBtnText}>Subscribe & Continue — ₹499/mo</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 6 }}>Cancel anytime · No lock-in · Refund within 7 days</Text>
            </View>
          )}

          {gte(21.5 as any) && <UserBubble text="Payment completed" />}

          {/* Welcome to premium */}
          {gte(21.5 as any) && <BotBubble>
            <View style={s.sw}><View style={[s.si, { backgroundColor: Colors.primary }]}><FontAwesome name="star" size={14} color="#FFF" /></View><Text style={[s.st, { color: Colors.primary }]}>Welcome to Credfix Premium!</Text></View>
            <Text style={s.bt}>Now let me analyze your legal notice in detail.</Text>
          </BotBubble>}

          {/* Step 22: Analysis */}
          {gte(22) && <BotBubble>
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
          {gte(22) && !gte(23) && !typing && (
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
          {gte(23) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
            <UserBubble text={legalChoice === 'settlement' ? 'I want to request a settlement' : 'I want to request full closure'} />
          )}

          {/* Explain what to expect + proof picker */}
          {gte(24) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
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
              {selectedProofs.length > 0 && !uploadingProofs && !gte(25) && (
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
          {gte(25) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
            <BotBubble>
              <Text style={s.bt}>Documents uploaded. Here's the draft response:</Text>
              <View style={s.draftCard}>
                <Text style={s.dTo}>To: {data.email}</Text>
                <Text style={s.dSub}>Re: {legalChoice === 'settlement' ? 'Settlement Request' : 'Closure Request'} — {data.account}</Text>
                <View style={s.divider} />
                <Text style={s.dBody}>{draftForChoice(legalChoice)}</Text>
              </View>
              <TouchableOpacity style={s.pb} onPress={lSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Approve & Send</Text></TouchableOpacity>
              <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}><FontAwesome name="headphones" size={12} color={Colors.primary} /><Text style={s.expertBtnText}>Talk to expert</Text></TouchableOpacity>
            </BotBubble>
          )}

          {/* Sent + what happens next */}
          {gte(26) && (legalChoice === 'settlement' || legalChoice === 'closure') && !gte(40) && (
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
              <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}><FontAwesome name="headphones" size={12} color={Colors.primary} /><Text style={s.expertBtnText}>Talk to expert</Text></TouchableOpacity>
            </BotBubble>
          )}

          {/* ── TIME PATH ── */}
          {gte(23) && legalChoice === 'time' && !gte(40) && (
            <UserBubble text="I need more time to arrange the payment" />
          )}
          {gte(24) && legalChoice === 'time' && !gte(40) && (
            <BotBubble>
              <View style={s.warningCard}><FontAwesome name="exclamation-triangle" size={14} color="#DC2626" /><Text style={s.warningText}>Important: The lender is not obligated to grant an extension. They may still proceed with legal action even if you request more time. The notice deadline ({notice.deadline}) remains enforceable.</Text></View>
              <Text style={[s.bt, { marginTop: 10 }]}>I'd recommend requesting a settlement instead — it resolves the matter faster and removes legal risk. But if you still want more time, I can draft that request too.</Text>
              <Text style={[s.bt, { marginTop: 8, fontWeight: '600' }]}>What would you prefer?</Text>
            </BotBubble>
          )}
          {gte(24) && legalChoice === 'time' && !gte(40) && !typing && (
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

        {/* ══ HARASSMENT — Neytra intro + premium + activate ══ */}
        {it === 'harassment' && (<>
          {/* Step 1: Intro to Neytra */}
          {gte(1) && <BotBubble>
            <Text style={s.bt}>I'm sorry you're going through this. Recovery calls can be incredibly stressful — but you don't have to deal with them alone.</Text>
            <Text style={[s.bt, { marginTop: 10, fontWeight: '600' }]}>Meet Neytra — your AI call shield</Text>
            <Text style={[s.bt, { marginTop: 4 }]}>Neytra answers recovery calls on your behalf, records violations, and protects you from harassment. Watch this short intro:</Text>
            <View style={s.videoCard}>
              <View style={s.videoThumb}><View style={s.videoPlayBtn}><FontAwesome name="play" size={20} color="#FFF" /></View></View>
              <Text style={s.videoTitle}>How Neytra Protects You</Text>
              <Text style={s.videoDesc}>1 min · AI call shield, violation recording, and RBI compliance</Text>
            </View>
            <View style={s.ackCard}>
              <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color="#059669" /><Text style={s.ackText}>Automatically answers recovery & collection calls</Text></View>
              <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color="#059669" /><Text style={s.ackText}>Records calls and flags RBI guideline violations</Text></View>
              <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color="#059669" /><Text style={s.ackText}>Your personal contacts always ring through normally</Text></View>
              <View style={s.ackItem}><FontAwesome name="check-circle" size={13} color="#059669" /><Text style={s.ackText}>Evidence collected can be used for formal complaints</Text></View>
            </View>
          </BotBubble>}

          {/* Intent to activate */}
          {gte(1) && !gte(30) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.pb} onPress={hWatchedVideo} activeOpacity={0.8}>
                <FontAwesome name="shield" size={14} color="#FFF" />
                <Text style={s.pbt}>I want Neytra protection</Text>
              </TouchableOpacity>
            </View>
          )}

          {gte(30) && <UserBubble text="I want to activate Neytra" />}

          {/* Step 31: Premium subscription */}
          {gte(31) && !isPremium && <BotBubble>
            <Text style={s.bt}>Neytra is part of <Text style={{ fontWeight: '700', color: Colors.primary }}>Credfix Premium</Text>. Here's everything you get:</Text>
            <View style={s.premiumCard}>
              <View style={s.premiumHeader}><Text style={s.premiumTitle}>Credfix Premium</Text><View style={s.premiumPricePill}><Text style={s.premiumPrice}>₹499/mo</Text></View></View>
              <View style={s.premiumFeature}><FontAwesome name="shield" size={12} color="#059669" /><Text style={s.premiumFeatText}>Neytra Call Management — AI answers & records all recovery calls</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="gavel" size={12} color="#DC2626" /><Text style={s.premiumFeatText}>Legal Notice Response — Expert-drafted replies with hardship documentation</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="handshake-o" size={12} color={Colors.primary} /><Text style={s.premiumFeatText}>Expert-led Settlement — Dedicated negotiation with lenders for best offers</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="comments" size={12} color="#7C3AED" /><Text style={s.premiumFeatText}>Unlimited Risi Access — 24/7 AI assistance for all your loan queries</Text></View>
            </View>
          </BotBubble>}

          {gte(31) && !isPremium && !gte(31.5 as any) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.premiumBtn} onPress={hCompletePay} activeOpacity={0.8}>
                <FontAwesome name="lock" size={13} color="#FFF" />
                <Text style={s.premiumBtnText}>Subscribe & Continue — ₹499/mo</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 6 }}>Cancel anytime · No lock-in · Refund within 7 days</Text>
            </View>
          )}

          {gte(31.5 as any) && <UserBubble text="Payment completed" />}

          {/* Step 32: Welcome + activate Neytra */}
          {gte(32) && <BotBubble>
            <View style={s.sw}><View style={[s.si, { backgroundColor: Colors.primary }]}><FontAwesome name="star" size={14} color="#FFF" /></View><Text style={[s.st, { color: Colors.primary }]}>Welcome to Credfix Premium!</Text></View>
            <Text style={s.bt}>You're all set. Let's activate Neytra now so it can start protecting you from recovery calls immediately.</Text>
            <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}><FontAwesome name="headphones" size={12} color={Colors.primary} /><Text style={s.expertBtnText}>Talk to expert</Text></TouchableOpacity>
          </BotBubble>}

          {gte(32) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.pb} onPress={hActivateNeytra} activeOpacity={0.8}>
                <FontAwesome name="shield" size={14} color="#FFF" />
                <Text style={s.pbt}>Activate Neytra Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </>)}

        {/* ══ RECOVERY — lender → rights+video → want stop → premium → issues → proof → draft → send ══ */}
        {it === 'recovery' && (<>

          {/* Step 1: Lender picker */}
          {gte(1) && <BotBubble>
            <Text style={s.bt}>I'm really sorry this happened to you. No one should have to deal with this at their doorstep. Let me help you take the right action.</Text>
            <Text style={[s.bt, { marginTop: 8 }]}>Which lender's recovery agent visited you?</Text>
            <View style={s.loanPicker}>
              {Object.entries(LD).map(([name, d]) => (
                <TouchableOpacity key={name} style={[s.loanPickItem, name === ln && s.loanPickItemSel]} activeOpacity={0.7} onPress={() => { if (name === ln) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(1.5 as any); setTimeout(() => adv(50), 300) } }}>
                  <View style={s.loanPickIcon}><FontAwesome name="university" size={13} color={name === ln ? Colors.primary : Colors.textMuted} /></View>
                  <View style={{ flex: 1 }}><Text style={[s.loanPickName, name === ln && { color: Colors.primary }]}>{name}</Text><Text style={s.loanPickSub}>{d.outstanding} outstanding</Text></View>
                  <FontAwesome name="chevron-right" size={10} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </BotBubble>}

          {gte(1.5 as any) && <UserBubble text={`Recovery agent from ${ln} visited me`} />}

          {/* Step 50: Rights explanation + video */}
          {gte(50) && <BotBubble>
            <Text style={[s.bt, { fontWeight: '600' }]}>Know your rights as a borrower</Text>
            <Text style={[s.bt, { marginTop: 6 }]}>Recovery agents are bound by strict RBI rules. Watch this short video to understand what they can and cannot do:</Text>
            <View style={s.videoCard}>
              <View style={s.videoThumb}><View style={s.videoPlayBtn}><FontAwesome name="play" size={20} color="#FFF" /></View></View>
              <Text style={s.videoTitle}>Your Rights During Recovery Visits</Text>
              <Text style={s.videoDesc}>2 min · What agents can't do, how to protect yourself, and next steps</Text>
            </View>
            <Text style={[s.bt, { marginTop: 12 }]}>Under the RBI Fair Practices Code, recovery agents <Text style={{ fontWeight: '700' }}>cannot</Text>:</Text>
            <View style={[s.ackCard, { marginTop: 8 }]}>
              <View style={s.ackItem}><FontAwesome name="times-circle" size={13} color={Colors.alert} /><Text style={s.ackText}>Visit before 7 AM or after 7 PM</Text></View>
              <View style={s.ackItem}><FontAwesome name="times-circle" size={13} color={Colors.alert} /><Text style={s.ackText}>Use abusive, threatening, or intimidating language</Text></View>
              <View style={s.ackItem}><FontAwesome name="times-circle" size={13} color={Colors.alert} /><Text style={s.ackText}>Contact your neighbours, family, or employer</Text></View>
              <View style={s.ackItem}><FontAwesome name="times-circle" size={13} color={Colors.alert} /><Text style={s.ackText}>Visit without proper identification</Text></View>
              <View style={s.ackItem}><FontAwesome name="times-circle" size={13} color={Colors.alert} /><Text style={s.ackText}>Damage property or create a public scene</Text></View>
            </View>
            <Text style={[s.bt, { marginTop: 12 }]}>Did you face any issues during the visit? Would you like to request the lender to stop all recovery visits?</Text>
          </BotBubble>}

          {/* Want to stop visits? */}
          {gte(50) && !gte(50.5 as any) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.pb} onPress={rWantStop} activeOpacity={0.8}>
                <FontAwesome name="hand-stop-o" size={14} color="#FFF" />
                <Text style={s.pbt}>Yes, stop the visits & report issues</Text>
              </TouchableOpacity>
            </View>
          )}

          {gte(50.5 as any) && <UserBubble text="Yes, I want to stop the visits and report what happened" />}

          {/* Step 51: Premium subscription — if not premium */}
          {gte(51) && !isPremium && <BotBubble>
            <Text style={s.bt}>To file a formal complaint and get expert support in handling recovery agents, you'll need <Text style={{ fontWeight: '700', color: Colors.primary }}>Credfix Premium</Text>:</Text>
            <View style={s.premiumCard}>
              <View style={s.premiumHeader}><Text style={s.premiumTitle}>Credfix Premium</Text><View style={s.premiumPricePill}><Text style={s.premiumPrice}>₹499/mo</Text></View></View>
              <View style={s.premiumFeature}><FontAwesome name="shield" size={12} color="#059669" /><Text style={s.premiumFeatText}>Neytra Call Management — AI answers & records all recovery calls</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="gavel" size={12} color="#DC2626" /><Text style={s.premiumFeatText}>Legal Notice Response — Expert-drafted replies with hardship documentation</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="handshake-o" size={12} color={Colors.primary} /><Text style={s.premiumFeatText}>Expert-led Settlement — Dedicated negotiation with lenders for best offers</Text></View>
              <View style={s.premiumFeature}><FontAwesome name="comments" size={12} color="#7C3AED" /><Text style={s.premiumFeatText}>Unlimited Risi Access — 24/7 AI assistance for all your loan queries</Text></View>
            </View>
          </BotBubble>}

          {gte(51) && !isPremium && !gte(51.5 as any) && !typing && (
            <View style={s.aw}>
              <TouchableOpacity style={s.premiumBtn} onPress={rCompletePay} activeOpacity={0.8}>
                <FontAwesome name="lock" size={13} color="#FFF" />
                <Text style={s.premiumBtnText}>Subscribe & Continue — ₹499/mo</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 6 }}>Cancel anytime · No lock-in · Refund within 7 days</Text>
            </View>
          )}

          {gte(51.5 as any) && <UserBubble text="Payment completed" />}

          {gte(51.5 as any) && <BotBubble>
            <View style={s.sw}><View style={[s.si, { backgroundColor: Colors.primary }]}><FontAwesome name="star" size={14} color="#FFF" /></View><Text style={[s.st, { color: Colors.primary }]}>Welcome to Credfix Premium!</Text></View>
            <Text style={s.bt}>Now let's document what happened during the visit so I can draft a strong complaint.</Text>
          </BotBubble>}

          {/* Step 52: Issue selection */}
          {gte(52) && <BotBubble>
            <Text style={[s.bt, { fontWeight: '600' }]}>What issues did you face during the visit?</Text>
            <Text style={[s.bt, { marginTop: 4 }]}>Select everything that applies — each one strengthens your complaint:</Text>
          </BotBubble>}

          {gte(52) && !gte(52.5 as any) && !typing && (
            <View style={s.aw}>
              <View style={s.proofList}>
                {VISIT_ISSUES.map((issue) => {
                  const sel = selectedIssues.includes(issue.key)
                  return (
                    <TouchableOpacity key={issue.key} style={[s.proofItem, sel && s.proofItemSel]} onPress={() => toggleIssue(issue.key)} activeOpacity={0.7}>
                      <FontAwesome name={issue.icon as any} size={14} color={sel ? Colors.alert : Colors.textMuted} />
                      <Text style={[s.proofText, sel && s.proofTextSel]}>{issue.label}</Text>
                      <FontAwesome name={sel ? 'check-square' : 'square-o'} size={16} color={sel ? Colors.alert : '#D1D5DB'} />
                    </TouchableOpacity>
                  )
                })}
              </View>
              {selectedIssues.length > 0 && (
                <TouchableOpacity style={[s.pb, { marginTop: 10 }]} onPress={rSelectIssues} activeOpacity={0.8}>
                  <FontAwesome name="arrow-right" size={14} color="#FFF" />
                  <Text style={s.pbt}>Continue with {selectedIssues.length} issue{selectedIssues.length > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {gte(52.5 as any) && <UserBubble text={`Reported ${selectedIssues.length} issue${selectedIssues.length > 1 ? 's' : ''} during the visit`} />}

          {/* Step 53: Proof upload */}
          {gte(53) && <BotBubble>
            <Text style={s.bt}>Do you have any evidence from the visit? It makes the complaint much stronger:</Text>
            <View style={s.proofList}>
              {[
                { key: 'photo', label: 'Photos or videos of the visit', icon: 'camera' },
                { key: 'recording', label: 'Audio recording of the conversation', icon: 'microphone' },
                { key: 'witness', label: 'Written statement from a witness', icon: 'file-text-o' },
                { key: 'damage_proof', label: 'Photos of any property damage', icon: 'picture-o' },
                { key: 'id_missing', label: 'Note that agent had no ID card', icon: 'id-card-o' },
              ].map((p) => {
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
            {selectedProofs.length > 0 && !uploadingProofs && !gte(54) && (
              <TouchableOpacity style={[s.pb, { marginTop: 10 }]} onPress={rProofsDone} activeOpacity={0.8}>
                <FontAwesome name="cloud-upload" size={14} color="#FFF" />
                <Text style={s.pbt}>Upload {selectedProofs.length} file{selectedProofs.length > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
            {uploadingProofs && !gte(54) && (
              <View style={{ marginTop: 10 }}>
                {selectedProofs.map((key, i) => {
                  const labels: Record<string, string> = { photo: 'Visit_Photo', recording: 'Audio_Recording', witness: 'Witness_Statement', damage_proof: 'Damage_Photo', id_missing: 'No_ID_Note' }
                  return <FileUploadAnim key={key} name={`${labels[key] || 'Document'}.pdf`} onDone={i === selectedProofs.length - 1 ? rProofsUploaded : () => {}} />
                })}
              </View>
            )}
            {!uploadingProofs && !gte(54) && (
              <TouchableOpacity style={s.skipProofBtn} onPress={rSkipProofs} activeOpacity={0.7}>
                <Text style={s.skipProofText}>I don't have proof right now → Continue without</Text>
              </TouchableOpacity>
            )}
          </BotBubble>}

          {gte(53.5 as any) && !selectedProofs.length && <UserBubble text="Continue without proof for now" />}

          {/* Step 54: Draft complaint */}
          {gte(54) && <BotBubble>
            <Text style={s.bt}>{selectedProofs.length > 0 ? 'Evidence uploaded. ' : ''}Here's the formal complaint I've drafted:</Text>
            <View style={s.draftCard}>
              <Text style={s.dTo}>To: {data.email}</Text>
              <Text style={s.dSub}>Formal Complaint — Recovery Agent Misconduct & Cessation Request — {data.account}</Text>
              <View style={s.divider} />
              <Text style={s.dBody}>
                Dear Sir/Madam,{'\n\n'}I am writing to formally report serious violations of the RBI Fair Practices Code by your recovery agent who visited my residence regarding account {data.account} (outstanding: {data.outstanding}).{'\n\n'}The following issues occurred during the visit:{'\n'}{selectedIssues.map((key) => {
                  const issue = VISIT_ISSUES.find((v) => v.key === key)
                  return `• ${issue?.label || key}`
                }).join('\n')}{'\n\n'}{selectedProofs.length > 0 ? 'I have attached evidence documenting these violations.\n\n' : ''}I hereby demand:{'\n'}1. Immediate stop to all field recovery visits to my residence{'\n'}2. Formal acknowledgement of the violations reported above{'\n'}3. Details of the recovery agent including name, ID, and authorisation{'\n'}4. Written confirmation that no further visits will be made without prior notice and compliance with RBI guidelines{'\n\n'}Please note that continued violations will be escalated to the Banking Ombudsman and formally reported to the Reserve Bank of India.{'\n\n'}Regards,{'\n'}Sunil Singh
              </Text>
            </View>
            <TouchableOpacity style={s.pb} onPress={rSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Send Complaint to {ln}</Text></TouchableOpacity>
            <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}><FontAwesome name="headphones" size={12} color={Colors.primary} /><Text style={s.expertBtnText}>Talk to expert</Text></TouchableOpacity>
          </BotBubble>}

          {/* Step 55: Success */}
          {gte(55) && <BotBubble>
            <View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Complaint filed!</Text></View>
            <Text style={s.bt}>Your complaint documenting {selectedIssues.length} violation{selectedIssues.length > 1 ? 's' : ''} has been sent to {ln} along with a formal request to stop all recovery visits.{selectedProofs.length > 0 ? ' Evidence has been attached.' : ''}</Text>
            <View style={s.insightCard}>
              <FontAwesome name="lightbulb-o" size={14} color="#D97706" />
              <Text style={s.insightText}>The lender is legally required to respond within 30 days. If they don't act, or if the visits continue, I can escalate to the Banking Ombudsman immediately. I'd also recommend activating Neytra to handle future recovery calls.</Text>
            </View>
            <TouchableOpacity style={s.expertBtn} onPress={() => Haptics.selectionAsync()} activeOpacity={0.7}><FontAwesome name="headphones" size={12} color={Colors.primary} /><Text style={s.expertBtnText}>Talk to expert</Text></TouchableOpacity>
          </BotBubble>}
        </>)}

        {typing && <TypingIndicator />}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.qr}>
        {(gte(12) || gte(26) || gte(32) || gte(44) || gte(55)) && <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)') }}><Text style={s.chipText}>Go home</Text></TouchableOpacity>}
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

  // Loan picker
  loanPicker: { marginTop: 10, gap: 6 },
  loanPickItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  loanPickItemSel: { borderColor: Colors.primary, backgroundColor: '#FAFAFF' },
  loanPickIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  loanPickName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  loanPickSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },

  // Video placeholder
  videoCard: { backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', marginTop: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  videoThumb: { height: 140, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  videoPlayBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(74,58,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  videoTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, padding: 12, paddingBottom: 2 },
  videoDesc: { fontSize: 11, color: Colors.textMuted, paddingHorizontal: 12, paddingBottom: 12 },

  // Acknowledgement
  ackCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#F0F0F5', gap: 10 },
  ackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  ackText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, flex: 1 },

  // Premium card
  premiumCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginTop: 10, borderWidth: 1.5, borderColor: '#DDD8FF' },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  premiumTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  premiumPricePill: { backgroundColor: '#F0EDFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  premiumPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  premiumFeature: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  premiumFeatText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, flex: 1 },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#166534', borderRadius: 14, paddingVertical: 15 },
  premiumBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Uploaded notice
  uploadedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 38, marginBottom: 12,
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  uploadedIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  uploadedName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  uploadedStatus: { fontSize: 11, color: '#059669', marginTop: 2 },

  // Skip proof
  skipProofBtn: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
  skipProofText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  // Expert CTA
  expertBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#DDD8FF', backgroundColor: '#FAFAFF' },
  expertBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
})
