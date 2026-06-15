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
      <View style={s.avWrap}><Image source={require('@/assets/risi-nav.png')} style={s.avImg} resizeMode="contain" /></View>
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
const PROOF_OPTIONS = [
  { key: 'salary', label: 'Salary slips / Termination letter', icon: 'file-text-o' },
  { key: 'medical', label: 'Medical bills / Hospital records', icon: 'medkit' },
  { key: 'bank', label: 'Bank statement (last 3 months)', icon: 'bank' },
  { key: 'income', label: 'Income tax returns', icon: 'file-o' },
  { key: 'other', label: 'Other supporting documents', icon: 'paperclip' },
]

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN') }
const EST_SETTLEMENT = 31000 // ~58% of 53200

function draftForChoice(choice: string) {
  if (choice === 'settlement') return `Dear Sir/Madam,\n\nWith reference to the Sec 25 Recovery Notice regarding my account XXXX-1234 (outstanding: ₹53,200), I wish to propose a one-time settlement of ${fmt(EST_SETTLEMENT)} to resolve this matter amicably.\n\nI am facing genuine financial hardship and have attached supporting documents for your consideration.\n\nI request you to:\n1. Accept the settlement proposal\n2. Withdraw any pending legal proceedings\n3. Issue a No Objection Certificate upon payment\n\nI am committed to making the payment within 2 months of acceptance.\n\nRegards,\nSunil Singh`
  if (choice === 'closure') return `Dear Sir/Madam,\n\nWith reference to the Sec 25 Recovery Notice regarding my account XXXX-1234 (outstanding: ₹53,200), I wish to close this account by paying the full outstanding amount.\n\nI am facing temporary financial difficulties and request a timeline of 2 months to arrange the full payment of ₹53,200.\n\nI request you to:\n1. Confirm the exact closure amount including any accrued charges\n2. Pause any legal proceedings during this period\n3. Issue a No Objection Certificate and update credit bureau records upon closure\n\nI have attached proof of my financial situation for your reference.\n\nRegards,\nSunil Singh`
  return `Dear Sir/Madam,\n\nWith reference to the Sec 25 Recovery Notice regarding my account XXXX-1234 (outstanding: ₹53,200), I am writing to request additional time to arrange the repayment.\n\nI am currently facing severe financial hardship due to loss of employment and mounting expenses. I am committed to resolving this matter but need 3 months to stabilise my finances.\n\nI request you to:\n1. Grant an extension of 3 months for repayment\n2. Pause any further legal proceedings during this period\n3. Consider restructuring the repayment terms\n\nI have attached supporting documents demonstrating my current financial situation.\n\nRegards,\nSunil Singh`
}

/* ── Main ── */

export default function LegalChatScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [choice, setChoice] = useState<'settlement' | 'closure' | 'time' | ''>('')
  const [selectedProofs, setSelectedProofs] = useState<string[]>([])
  const [uploadingProofs, setUploadingProofs] = useState(false)

  const scroll = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  const adv = (n: number, d = 1500) => { setTyping(true); scroll(); setTimeout(() => { setTyping(false); setStep(n); scroll() }, d) }
  useEffect(() => { const t = setTimeout(() => adv(1, 1800), 800); return () => clearTimeout(t) }, [])
  const gte = (n: number) => step >= n

  const toggleProof = (key: string) => setSelectedProofs((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key])

  /* Settlement / Closure path */
  const handleChoose = (c: 'settlement' | 'closure' | 'time') => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setChoice(c); setStep(2); scroll(); setTimeout(() => adv(3), 300) }
  const handleProofsDone = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }
  const handleProofsUploaded = () => { setUploadingProofs(false); adv(4) }
  const handleSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(5) }

  /* Time path */
  const handleTimeUnderstand = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(10); scroll(); setTimeout(() => adv(11), 300) }
  const handleTimeSwitchSettlement = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setChoice('settlement'); setStep(12); scroll(); setTimeout(() => adv(13), 300) }
  const handleTimeSend = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(14) }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/chat/risi-hub')} style={s.backBtn}><FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} /></TouchableOpacity>
        <View style={s.hCenter}><Text style={s.hTitle}>HDFC Bank</Text><Text style={s.hSub}>Legal Notice Thread</Text></View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} style={s.chat} contentContainerStyle={s.chatContent} showsVerticalScrollIndicator={false}>

        {/* ── Auto-detected notice — already analyzed ── */}
        <Timestamp text="Today" />

        <BotBubble>
          <View style={s.alertBadge}>
            <FontAwesome name="exclamation-circle" size={10} color="#DC2626" />
            <Text style={s.alertBadgeText}>Critical — Auto-detected from your email</Text>
          </View>
          <Text style={[s.bt, { marginTop: 8 }]}>
            I detected a critical legal notice in your Gmail from HDFC Bank and have already analyzed it:
          </Text>
          <View style={s.noticeCard}>
            <View style={s.noticeHeader}><FontAwesome name="file-pdf-o" size={16} color="#DC2626" /><Text style={s.noticeHeaderText}>Legal Notice — HDFC Bank</Text></View>
            <View style={s.nRow}><Text style={s.nLabel}>Notice Type</Text><Text style={s.nValue}>Sec 25 — Recovery Notice</Text></View>
            <View style={s.nRow}><Text style={s.nLabel}>Section</Text><Text style={s.nValue}>Section 25 — Recovery of Debts</Text></View>
            <View style={s.nRow}><Text style={s.nLabel}>Account</Text><Text style={s.nValue}>XXXX-1234</Text></View>
            <View style={s.nRow}><Text style={s.nLabel}>Outstanding</Text><Text style={s.nValue}>₹53,200</Text></View>
            <View style={s.nRow}><Text style={s.nLabel}>Urgency</Text><Text style={[s.nValue, { color: '#DC2626' }]}>Critical</Text></View>
            <View style={s.nRow}><Text style={s.nLabel}>Response Deadline</Text><Text style={[s.nValue, { color: Colors.alert }]}>4 days left</Text></View>
          </View>
          <View style={s.explainCard}>
            <FontAwesome name="info-circle" size={13} color={Colors.primary} />
            <Text style={s.explainText}>This is a formal recovery notice. Non-response within the deadline may lead to further legal proceedings including asset attachment. However, this is very much negotiable.</Text>
          </View>
          <Text style={[s.bt, { marginTop: 12, fontWeight: '600' }]}>Recommended steps:</Text>
          <View style={s.stepsList}>
            {['Respond within 4 days — this is legally required', 'Communicate willingness to resolve amicably', 'Request settlement or restructuring with hardship proof', 'Document all communications for your records'].map((st, i) => (
              <View key={i} style={s.stepItem}><View style={s.stepNum}><Text style={s.stepNumT}>{i + 1}</Text></View><Text style={s.stepT}>{st}</Text></View>
            ))}
          </View>
        </BotBubble>

        {/* ── 3 response options ── */}
        {gte(1) && (
          <BotBubble>
            <Text style={[s.bt, { fontWeight: '600' }]}>How would you like to respond?</Text>
          </BotBubble>
        )}

        {gte(1) && !gte(2) && !typing && (
          <View style={s.aw}>
            <TouchableOpacity style={s.optBtn} onPress={() => handleChoose('settlement')} activeOpacity={0.8}>
              <FontAwesome name="handshake-o" size={14} color={Colors.primary} />
              <View style={{ flex: 1 }}><Text style={s.optTitle}>Request Settlement</Text><Text style={s.optDesc}>Negotiate a lower amount (~{fmt(EST_SETTLEMENT)})</Text></View>
              <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={s.optBtn} onPress={() => handleChoose('closure')} activeOpacity={0.8}>
              <FontAwesome name="check-circle" size={14} color="#059669" />
              <View style={{ flex: 1 }}><Text style={s.optTitle}>Request Full Closure</Text><Text style={s.optDesc}>Pay ₹53,200 in full — better for credit report</Text></View>
              <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={s.optBtn} onPress={() => handleChoose('time')} activeOpacity={0.8}>
              <FontAwesome name="clock-o" size={14} color="#D97706" />
              <View style={{ flex: 1 }}><Text style={s.optTitle}>Request More Time</Text><Text style={s.optDesc}>Ask the lender for an extension</Text></View>
              <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* ══ SETTLEMENT / CLOSURE PATH ══ */}
        {gte(2) && (choice === 'settlement' || choice === 'closure') && !gte(10) && (
          <UserBubble text={choice === 'settlement' ? 'I want to request a settlement' : 'I want to request full closure'} />
        )}

        {gte(3) && (choice === 'settlement' || choice === 'closure') && !gte(10) && (
          <BotBubble>
            <Text style={s.bt}>
              {choice === 'settlement'
                ? `With a settlement, you'll pay a reduced amount (estimated ${fmt(EST_SETTLEMENT)} instead of ₹53,200) and the account gets closed. The lender withdraws legal proceedings and you get an NOC.`
                : `With full closure, you pay the entire ₹53,200. This gives you a "Closed" status on your credit report — better than "Settled" for future loan eligibility.`}
            </Text>
            <Text style={[s.bt, { marginTop: 10, fontWeight: '600' }]}>Select the hardship proofs to attach:</Text>
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
            {selectedProofs.length > 0 && !uploadingProofs && !gte(4) && (
              <TouchableOpacity style={s.pb} onPress={handleProofsDone} activeOpacity={0.8}>
                <FontAwesome name="cloud-upload" size={14} color="#FFF" />
                <Text style={s.pbt}>Upload {selectedProofs.length} document{selectedProofs.length > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
            {uploadingProofs && (
              <View style={{ marginTop: 10 }}>
                {selectedProofs.map((key, i) => {
                  const p = PROOF_OPTIONS.find((o) => o.key === key)!
                  return <FileUploadAnim key={key} name={`${p.label.split('/')[0].trim()}.pdf`} onDone={i === selectedProofs.length - 1 ? handleProofsUploaded : () => {}} />
                })}
              </View>
            )}
          </BotBubble>
        )}

        {/* Draft */}
        {gte(4) && (choice === 'settlement' || choice === 'closure') && !gte(10) && (
          <BotBubble>
            <Text style={s.bt}>Documents uploaded. Here's the draft response:</Text>
            <View style={s.draftCard}>
              <Text style={s.dTo}>To: legal@hdfcbank.com</Text>
              <Text style={s.dSub}>Re: {choice === 'settlement' ? 'Settlement Request' : 'Closure Request'} — XXXX-1234</Text>
              <View style={s.divider} />
              <Text style={s.dBody}>{draftForChoice(choice)}</Text>
            </View>
            <TouchableOpacity style={s.pb} onPress={handleSend} activeOpacity={0.8}>
              <FontAwesome name="send" size={13} color="#FFF" />
              <Text style={s.pbt}>Approve & Send to HDFC Bank</Text>
            </TouchableOpacity>
          </BotBubble>
        )}

        {/* Sent + timeline */}
        {gte(5) && (choice === 'settlement' || choice === 'closure') && !gte(10) && (
          <BotBubble>
            <View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Response sent!</Text></View>
            <Text style={s.bt}>Your {choice === 'settlement' ? 'settlement request' : 'closure request'} with hardship proofs has been sent to HDFC Bank.</Text>
            <View style={s.trackerCard}>
              {['Notice Detected', 'Analyzed', 'Reply Sent', 'Bank Response', 'Resolution'].map((l, i) => (
                <View key={i} style={s.ts}><View style={[s.td, i <= 2 && s.tdd]}>{i <= 2 && <FontAwesome name="check" size={7} color="#FFF" />}</View>{i < 4 && <View style={[s.tl, i <= 1 && s.tld]} />}<Text style={[s.tlb, i <= 2 && s.tlbd]}>{l}</Text></View>
              ))}
            </View>
            <View style={s.timelineCard}>
              <Text style={s.timelineTitle}>What happens next</Text>
              <View style={s.tlItem}><View style={[s.tlDot, { backgroundColor: '#4A3AFF' }]} /><View style={{ flex: 1 }}><Text style={s.tlItemT}>Within 7 days</Text><Text style={s.tlItemD}>HDFC Bank reviews your response and proofs</Text></View></View>
              <View style={s.tlItem}><View style={[s.tlDot, { backgroundColor: '#D97706' }]} /><View style={{ flex: 1 }}><Text style={s.tlItemT}>7–15 days</Text><Text style={s.tlItemD}>{choice === 'settlement' ? 'Expect a counter-offer or acceptance' : 'Expect closure amount confirmation'}</Text></View></View>
              <View style={s.tlItem}><View style={[s.tlDot, { backgroundColor: '#22C55E' }]} /><View style={{ flex: 1 }}><Text style={s.tlItemT}>15–30 days</Text><Text style={s.tlItemD}>Finalise payment, legal proceedings withdrawn, receive NOC</Text></View></View>
            </View>
            <View style={s.insightCard}><FontAwesome name="lightbulb-o" size={14} color="#D97706" /><Text style={s.insightText}>I'll monitor for their response and notify you immediately. Most banks prefer {choice === 'settlement' ? 'settlement' : 'closure'} over prolonged legal proceedings.</Text></View>
          </BotBubble>
        )}

        {/* ══ MORE TIME PATH ══ */}
        {gte(2) && choice === 'time' && !gte(10) && (
          <UserBubble text="I need more time to arrange the payment" />
        )}
        {gte(3) && choice === 'time' && !gte(10) && (
          <BotBubble>
            <View style={s.warningCard}><FontAwesome name="exclamation-triangle" size={14} color="#DC2626" /><Text style={s.warningText}>Important: HDFC Bank is not obligated to grant an extension. They may still proceed with legal action even if you request more time. The 4-day deadline remains enforceable.</Text></View>
            <Text style={[s.bt, { marginTop: 10 }]}>I'd recommend requesting a settlement instead — it resolves the matter faster and removes legal risk. But if you still want more time, I can draft that request.</Text>
            <Text style={[s.bt, { marginTop: 8, fontWeight: '600' }]}>What would you prefer?</Text>
          </BotBubble>
        )}
        {gte(3) && choice === 'time' && !gte(10) && !typing && (
          <View style={s.aw}>
            <TouchableOpacity style={s.optBtn} onPress={handleTimeSwitchSettlement} activeOpacity={0.8}>
              <FontAwesome name="handshake-o" size={14} color={Colors.primary} />
              <View style={{ flex: 1 }}><Text style={s.optTitle}>Request Settlement Instead</Text><Text style={s.optDesc}>Better outcome — resolves legal risk</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={s.optBtn} onPress={handleTimeUnderstand} activeOpacity={0.8}>
              <FontAwesome name="clock-o" size={14} color="#D97706" />
              <View style={{ flex: 1 }}><Text style={s.optTitle}>I understand, request more time</Text><Text style={s.optDesc}>Draft extension request with hardship proof</Text></View>
            </TouchableOpacity>
          </View>
        )}

        {/* Time: user insists → proof picker */}
        {gte(10) && choice === 'time' && <UserBubble text="I understand the risk, please request more time" />}
        {gte(11) && choice === 'time' && (
          <BotBubble>
            <Text style={s.bt}>I'll draft the extension request. Select your hardship proofs:</Text>
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
            {selectedProofs.length > 0 && !uploadingProofs && !gte(12) && (
              <TouchableOpacity style={s.pb} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUploadingProofs(true); scroll() }} activeOpacity={0.8}>
                <FontAwesome name="cloud-upload" size={14} color="#FFF" />
                <Text style={s.pbt}>Upload {selectedProofs.length} document{selectedProofs.length > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
            {uploadingProofs && !gte(12) && (
              <View style={{ marginTop: 10 }}>
                {selectedProofs.map((key, i) => {
                  const p = PROOF_OPTIONS.find((o) => o.key === key)!
                  return <FileUploadAnim key={key} name={`${p.label.split('/')[0].trim()}.pdf`} onDone={i === selectedProofs.length - 1 ? () => { setUploadingProofs(false); adv(12) } : () => {}} />
                })}
              </View>
            )}
          </BotBubble>
        )}
        {gte(12) && choice === 'time' && (
          <BotBubble>
            <Text style={s.bt}>Here's the extension request:</Text>
            <View style={s.draftCard}>
              <Text style={s.dTo}>To: legal@hdfcbank.com</Text>
              <Text style={s.dSub}>Re: Request for Extension — XXXX-1234</Text>
              <View style={s.divider} />
              <Text style={s.dBody}>{draftForChoice('time')}</Text>
            </View>
            <TouchableOpacity style={s.pb} onPress={handleTimeSend} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Approve & Send</Text></TouchableOpacity>
          </BotBubble>
        )}
        {gte(14) && choice === 'time' && (
          <BotBubble>
            <View style={s.sw}><View style={s.si}><FontAwesome name="check" size={16} color="#FFF" /></View><Text style={s.st}>Request sent!</Text></View>
            <Text style={s.bt}>Your extension request has been sent to HDFC Bank with hardship documentation.</Text>
            <View style={s.insightCard}><FontAwesome name="lightbulb-o" size={14} color="#D97706" /><Text style={s.insightText}>If they don't grant the extension, I'll immediately help you explore settlement options. I'll keep you updated on their response.</Text></View>
          </BotBubble>
        )}

        {/* Time → switched to settlement */}
        {gte(12) && choice === 'settlement' && (step as number) >= 12 && (step as number) < 14 && (
          <>
            <UserBubble text="Let me request a settlement instead" />
            {gte(13) && (
              <BotBubble>
                <Text style={s.bt}>Smart choice. Here's the settlement request:</Text>
                <View style={s.draftCard}>
                  <Text style={s.dTo}>To: legal@hdfcbank.com</Text>
                  <Text style={s.dSub}>Re: Settlement Request — XXXX-1234</Text>
                  <View style={s.divider} />
                  <Text style={s.dBody}>{draftForChoice('settlement')}</Text>
                </View>
                <TouchableOpacity style={s.pb} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); adv(5) }} activeOpacity={0.8}><FontAwesome name="send" size={13} color="#FFF" /><Text style={s.pbt}>Approve & Send</Text></TouchableOpacity>
              </BotBubble>
            )}
          </>
        )}

        {typing && <TypingIndicator />}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.qr}>
        {(gte(5) || gte(14)) && (
          <>
            <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/chat/risi-hub') }}><Text style={s.chipText}>Risi threads</Text></TouchableOpacity>
            <TouchableOpacity style={s.chip} onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)') }}><Text style={s.chipText}>Go home</Text></TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  hCenter: { alignItems: 'center' }, hTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary }, hSub: { fontSize: 11, color: Colors.textMuted },
  chat: { flex: 1 }, chatContent: { padding: 16 },
  tsWrap: { alignItems: 'center', marginBottom: 14 }, tsText: { fontSize: 11, color: Colors.textMuted, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%' },
  userText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  avWrap: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' }, avImg: { width: 30, height: 30, borderRadius: 15 },
  botBubble: { backgroundColor: '#F9FAFB', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, flex: 1 },
  bt: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  typingBubble: { flexDirection: 'row', gap: 4, paddingVertical: 16, maxWidth: 70 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C0C0C8' },

  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#FECACA' },
  alertBadgeText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  noticeCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#FECACA' },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#FEE2E2' },
  noticeHeaderText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  nRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }, nLabel: { fontSize: 12, color: Colors.textSecondary }, nValue: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  explainCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#F0EDFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#DDD8FF' },
  explainText: { fontSize: 12, color: '#4A3AFF', lineHeight: 18, flex: 1 },
  stepsList: { marginTop: 8, gap: 6 }, stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  stepNumT: { fontSize: 10, fontWeight: '700', color: Colors.primary }, stepT: { fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },

  aw: { marginLeft: 38, marginBottom: 12 },
  optBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#E5E7EB' },
  optTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary }, optDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },

  proofList: { marginTop: 10, gap: 6 },
  proofItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  proofItemSel: { borderColor: Colors.primary, backgroundColor: '#FAFAFF' },
  proofText: { flex: 1, fontSize: 12, color: Colors.textSecondary }, proofTextSel: { color: Colors.textPrimary, fontWeight: '500' },

  uploadCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, marginLeft: 38, borderWidth: 1, borderColor: '#F0F0F5' },
  uploadHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  uploadName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary }, uploadSize: { fontSize: 10, color: Colors.textMuted },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }, progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.primary },

  pb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, marginTop: 10 },
  pbt: { fontSize: 14, fontWeight: '600', color: '#FFF' },

  draftCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F5' },
  dTo: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 }, dSub: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }, dBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#F0F0F5', marginVertical: 6 },

  sw: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  si: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  st: { fontSize: 16, fontWeight: '700', color: '#22C55E' },

  trackerCard: { flexDirection: 'row', marginTop: 12, marginBottom: 4 },
  ts: { flex: 1, alignItems: 'center' }, td: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  tdd: { backgroundColor: '#22C55E' }, tl: { position: 'absolute', top: 8, left: '60%', right: '-40%', height: 2, backgroundColor: '#E5E7EB' }, tld: { backgroundColor: '#22C55E' },
  tlb: { fontSize: 8, color: Colors.textMuted, textAlign: 'center' }, tlbd: { color: '#059669', fontWeight: '600' },

  timelineCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#F0F0F5' },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  tlItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tlDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  tlItemT: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary }, tlItemD: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, marginTop: 1 },

  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FEF3C7' },
  insightText: { fontSize: 12, color: '#92400E', lineHeight: 18, flex: 1 },
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FECACA' },
  warningText: { fontSize: 12, color: '#991B1B', lineHeight: 18, flex: 1 },

  qr: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chip: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
})
