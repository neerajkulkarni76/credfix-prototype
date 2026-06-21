import React, { useState } from 'react'
import {
  View, Text, Image, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Keyboard, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { useConversationStore } from '@/stores/conversationStore'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

/* ── Lenders ── */
const lenders = [
  { name: 'Bajaj Finserv', sub: 'Personal Loan · ₹86,200', dpd: 275 },
  { name: 'HDFC Bank', sub: 'Personal Loan · ₹53,200', dpd: 180 },
  { name: 'Tata Capital', sub: 'Personal Loan · ₹41,500', dpd: 85 },
  { name: 'Si Creva', sub: 'Personal Loan · ₹18,400', dpd: 31 },
  { name: 'Mpokket', sub: 'Short-term Loans · ₹7,000', dpd: 0 },
]

/* ── Loan-specific topics ── */
type TopicType = 'closure' | 'settlement' | 'legal' | 'harassment' | 'field_visit' | 'abuse' | 'score' | 'report'

const loanTopics = [
  { label: 'Close my loan', desc: 'Pay off and get NOC', type: 'closure' as TopicType, icon: 'check-circle', color: '#059669', bg: '#D1FAE5', threadType: 'Loan Closure', threadIcon: '✅' },
  { label: 'Settle for less', desc: 'Negotiate a lower amount', type: 'settlement' as TopicType, icon: 'handshake-o', color: '#4A3AFF', bg: '#F0EDFF', threadType: 'Settlement', threadIcon: '🤝' },
  { label: 'Got a legal notice', desc: 'Understand & respond', type: 'legal' as TopicType, icon: 'gavel', color: '#DC2626', bg: '#FEE2E2', threadType: 'Legal Notice', threadIcon: '⚖️' },
  { label: 'Too many calls', desc: 'Stop recovery calls', type: 'harassment' as TopicType, icon: 'phone', color: '#7C3AED', bg: '#EDE9FE', threadType: 'Harassment', threadIcon: '📞' },
  { label: 'Agent came home', desc: 'Handle field visit', type: 'field_visit' as TopicType, icon: 'home', color: '#D97706', bg: '#FEF3C7', threadType: 'Field Visit', threadIcon: '🏠' },
  { label: 'Threats or abuse', desc: 'Report & take action', type: 'abuse' as TopicType, icon: 'exclamation-triangle', color: '#DC2626', bg: '#FEE2E2', threadType: 'Abuse Report', threadIcon: '🚨' },
]

const generalTopics = [
  { label: 'How to improve my score', desc: 'Get a step-by-step plan', icon: 'line-chart', color: '#7C3AED', bg: '#EDE9FE', threadTitle: 'General — Score Improvement', threadIcon: '📈', route: '/chat/score-improvement' },
  { label: 'Help me understand my report', desc: 'What does it all mean', icon: 'file-text-o', color: '#D97706', bg: '#FEF3C7', threadTitle: 'General — Credit Report', threadIcon: '📋', route: '/(tabs)/report' },
  { label: 'Plan my loan closures', desc: 'Which loan to close first & how', icon: 'map-o', color: '#059669', bg: '#D1FAE5', threadTitle: 'General — Closure Planning', threadIcon: '🗺️', route: '/chat/score-improvement' },
  { label: 'Can I still get a loan?', desc: 'Options with a low score', icon: 'question-circle', color: '#4A3AFF', bg: '#F0EDFF', threadTitle: 'General — Loan Eligibility', threadIcon: '💡', route: '/chat/risi-hub' },
  { label: 'What are my rights?', desc: 'RBI rules that protect you', icon: 'shield', color: '#EA580C', bg: '#FED7AA', threadTitle: 'General — Borrower Rights', threadIcon: '🛡️', route: '/chat/risi-hub' },
  { label: 'Can they contact my family?', desc: 'What lenders can & cannot do', icon: 'users', color: '#DC2626', bg: '#FEE2E2', threadTitle: 'General — Privacy Rights', threadIcon: '👨‍👩‍👧', route: '/chat/risi-hub' },
  { label: 'What if I stop paying?', desc: 'Know the real consequences', icon: 'info-circle', color: '#D97706', bg: '#FEF3C7', threadTitle: 'General — Non-payment Impact', threadIcon: '⚠️', route: '/chat/risi-hub' },
  { label: 'Settled vs Closed — kya fark hai?', desc: 'How it affects future loans', icon: 'exchange', color: '#7C3AED', bg: '#EDE9FE', threadTitle: 'General — Settlement vs Closure', threadIcon: '🔄', route: '/chat/risi-hub' },
]

/* ── Route mapping for loan topics ── */
const TOPIC_ROUTE: Record<TopicType, string> = {
  closure: '/chat/thread', settlement: '/chat/thread', legal: '/chat/thread',
  harassment: '/chat/thread', field_visit: '/chat/thread', abuse: '/chat/thread',
  score: '/chat/score-improvement', report: '/(tabs)/report',
}

/* ── Smart categorization ── */
const KEYWORDS: { patterns: string[]; type: TopicType }[] = [
  { patterns: ['close', 'closure', 'noc', 'pay off', 'full payment'], type: 'closure' },
  { patterns: ['settle', 'settlement', 'negotiate', 'one time', 'ots', 'less'], type: 'settlement' },
  { patterns: ['legal', 'notice', 'section', 'court', 'arbitration'], type: 'legal' },
  { patterns: ['call', 'calling', 'harass', 'phone', 'ring'], type: 'harassment' },
  { patterns: ['visit', 'came home', 'doorstep', 'field', 'agent came'], type: 'field_visit' },
  { patterns: ['threat', 'abuse', 'abusing', 'rude', 'misbehav'], type: 'abuse' },
  { patterns: ['score', 'cibil', 'credit score', 'improve'], type: 'score' },
  { patterns: ['report', 'credit report', 'experian'], type: 'report' },
]

function categorize(text: string): TopicType | null {
  const lower = text.toLowerCase()
  for (const kw of KEYWORDS) { if (kw.patterns.some((p) => lower.includes(p))) return kw.type }
  return null
}

/* ── Components ── */

function UserBubble({ text }: { text: string }) {
  return <View style={st.userRow}><View style={st.userBubble}><Text style={st.userText}>{text}</Text></View></View>
}
function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.botRow}>
      <View style={st.botAv}><Image source={require('@/assets/risi-nav.png')} style={st.botAvImg} resizeMode="contain" /></View>
      <View style={st.botBubble}>{children}</View>
    </View>
  )
}

/* ── Main ── */

export default function NewConversationScreen() {
  const router = useRouter()
  const { preselect } = useLocalSearchParams<{ preselect?: string }>()
  const addConversation = useConversationStore((s) => s.addConversation)
  const [customText, setCustomText] = useState('')

  const preselectedTopic = preselect ? loanTopics.find((t) => t.type === preselect) || null : null
  const [pendingTopic, setPendingTopic] = useState<typeof loanTopics[0] | null>(preselectedTopic)
  const [userMessage, setUserMessage] = useState<string | null>(preselectedTopic?.label || null)

  const handleLoanTopic = (topic: typeof loanTopics[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setUserMessage(topic.label)
    setPendingTopic(topic)
  }

  const handleLenderSelect = (lender: typeof lenders[0]) => {
    if (!pendingTopic) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // Map closure/field_visit/abuse to the thread type the thread screen understands
    const threadType = pendingTopic.type === 'closure' ? 'closure'
      : pendingTopic.type === 'field_visit' ? 'recovery'
      : pendingTopic.type === 'abuse' ? 'harassment'
      : pendingTopic.type
    const threadPath = `chat/thread?lender=${encodeURIComponent(lender.name)}&type=${threadType}`
    addConversation(
      `${lender.name} — ${pendingTopic.threadType}`,
      `${pendingTopic.label} · ${lender.sub}`,
      pendingTopic.threadIcon,
      threadPath
    )
    router.push({ pathname: '/chat/thread', params: { lender: lender.name, type: threadType, userMsg: userMessage || undefined } } as any)
  }

  const handleGeneralTopic = (topic: typeof generalTopics[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    addConversation(topic.threadTitle, topic.label, topic.threadIcon, topic.route.replace('/', ''))
    router.push(topic.route as any)
  }

  const handleCustomSubmit = () => {
    if (!customText.trim()) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Keyboard.dismiss()
    const text = customText.trim()
    const category = categorize(text)

    if (category === 'score') {
      addConversation('General — Score Improvement', text, '📈', 'chat/score-improvement')
      setCustomText(''); router.push('/chat/score-improvement')
    } else if (category === 'report') {
      addConversation('General — Credit Report', text, '📋', '(tabs)/report')
      setCustomText(''); router.push('/(tabs)/report')
    } else if (category) {
      const topic = loanTopics.find((t) => t.type === category)
      if (topic) { setUserMessage(text); setPendingTopic(topic); setCustomText('') }
    } else {
      addConversation('General — Support', text, '👤', 'chat/risi-hub')
      setCustomText(''); router.push('/chat/risi-hub')
    }
  }

  const showChat = !!pendingTopic

  return (
    <SafeAreaView style={st.safe}>
      <KeyboardAvoidingView style={st.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={st.header}>
          <TouchableOpacity onPress={() => { if (showChat) { setPendingTopic(null); setUserMessage(null) } else router.replace('/(tabs)') }} style={st.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={st.headerTitle}>{showChat ? 'Select lender' : ''}</Text>
          <View style={{ width: 36 }} />
        </View>

        {!showChat ? (
          <>
            <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Risi greeting — compact */}
              <View style={st.greetRow}>
                <View style={st.greetAv}><Image source={require('@/assets/risi-nav.png')} style={st.greetAvImg} resizeMode="contain" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={st.greetTitle}>What's troubling you?</Text>
                  <Text style={st.greetSub}>Pick an issue or type below</Text>
                </View>
              </View>

              {/* Loan issues — vertical list */}
              <Text style={st.sectionLabel}>About a loan</Text>
              {loanTopics.map((item, i) => (
                <TouchableOpacity key={i} style={st.topicRow} activeOpacity={0.8} onPress={() => handleLoanTopic(item)}>
                  <View style={[st.topicIcon, { backgroundColor: item.bg }]}>
                    <FontAwesome name={item.icon as any} size={15} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.topicLabel}>{item.label}</Text>
                    <Text style={st.topicDesc}>{item.desc}</Text>
                  </View>
                  <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}

              {/* General — horizontal scroll chips */}
              <Text style={[st.sectionLabel, { marginTop: 20, marginBottom: 10 }]}>General questions</Text>
              <View style={{ marginHorizontal: -20 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipScroll}>
                  {generalTopics.map((item, i) => (
                    <TouchableOpacity key={i} style={st.chipCard} activeOpacity={0.8} onPress={() => handleGeneralTopic(item)}>
                      <View style={[st.chipIcon, { backgroundColor: item.bg }]}>
                        <FontAwesome name={item.icon as any} size={12} color={item.color} />
                      </View>
                      <Text style={st.chipLabel} numberOfLines={2}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Input */}
            <View style={st.inputBar}>
              <View style={st.inputWrap}>
                <TextInput style={st.input} placeholder="Or type your question..." placeholderTextColor={Colors.textMuted} value={customText} onChangeText={setCustomText} returnKeyType="send" onSubmitEditing={handleCustomSubmit} />
                {customText.trim() ? (
                  <TouchableOpacity style={st.sendBtn} onPress={handleCustomSubmit}><FontAwesome name="arrow-right" size={14} color="#FFF" /></TouchableOpacity>
                ) : (
                  <TouchableOpacity style={st.micBtn}><FontAwesome name="microphone" size={16} color={Colors.primary} /></TouchableOpacity>
                )}
              </View>
            </View>
          </>
        ) : (
          /* ── Lender picker as chat ── */
          <ScrollView contentContainerStyle={st.chatContent} showsVerticalScrollIndicator={false}>
            <UserBubble text={userMessage || pendingTopic.label} />
            <BotBubble>
              <Text style={st.botText}>I can help you with that. Which lender is this about?</Text>
              <View style={st.lenderList}>
                {lenders.map((lender, i) => (
                  <TouchableOpacity key={i} style={st.lenderCard} activeOpacity={0.8} onPress={() => handleLenderSelect(lender)}>
                    <View style={st.lenderIcon}><FontAwesome name="university" size={14} color={Colors.primary} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.lenderName}>{lender.name}</Text>
                      <Text style={st.lenderSub}>{lender.sub}</Text>
                    </View>
                    {lender.dpd > 0 && (
                      <View style={[st.dpdPill, lender.dpd > 90 ? st.dpdSevere : lender.dpd > 30 ? st.dpdMod : st.dpdMild]}>
                        <Text style={[st.dpdText, lender.dpd > 90 ? st.dpdTextSevere : lender.dpd > 30 ? st.dpdTextMod : st.dpdTextMild]}>
                          {lender.dpd > 90 ? `${Math.round(lender.dpd / 30)}m overdue` : `${lender.dpd}d late`}
                        </Text>
                      </View>
                    )}
                    <FontAwesome name="chevron-right" size={11} color={Colors.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </BotBubble>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 16 },

  // Greeting
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, paddingTop: 4 },
  greetAv: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  greetAvImg: { width: 44, height: 44, borderRadius: 22 },
  greetTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  greetSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  // Section
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },

  // Topic rows
  topicRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  topicIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  topicLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  topicDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },


  // General chips
  chipScroll: { paddingHorizontal: 20, gap: 8 },
  chipCard: {
    width: 130, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  chipIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, lineHeight: 17 },

  // Input
  inputBar: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingLeft: 16, paddingRight: 5, height: 50, borderWidth: 1.5, borderColor: '#E5E7EB' },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  micBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },

  // Chat / lender picker
  chatContent: { padding: 16 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%' },
  userText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  botAv: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
  botAvImg: { width: 30, height: 30, borderRadius: 15 },
  botBubble: { backgroundColor: '#F9FAFB', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, flex: 1 },
  botText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },

  lenderList: { marginTop: 12, gap: 6 },
  lenderCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  lenderIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  lenderName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  lenderSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  dpdPill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  dpdSevere: { backgroundColor: '#FEE2E2' }, dpdMod: { backgroundColor: '#FED7AA' }, dpdMild: { backgroundColor: '#FEF3C7' },
  dpdText: { fontSize: 9, fontWeight: '700' },
  dpdTextSevere: { color: '#DC2626' }, dpdTextMod: { color: '#EA580C' }, dpdTextMild: { color: '#D97706' },
})
