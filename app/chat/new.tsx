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

/* ── Lenders from credit report ── */
const lenders = [
  { name: 'Bajaj Finserv', sub: 'Personal Loan · ₹86,200', dpd: 275 },
  { name: 'HDFC Bank', sub: 'Personal Loan · ₹53,200', dpd: 180 },
  { name: 'Tata Capital', sub: 'Personal Loan · ₹41,500', dpd: 85 },
  { name: 'Si Creva', sub: 'Personal Loan · ₹18,400', dpd: 31 },
  { name: 'Mpokket', sub: 'Short-term Loans · ₹7,000', dpd: 0 },
]

/* ── Topics ── */
type TopicType = 'settlement' | 'legal' | 'harassment' | 'recovery' | 'score' | 'report'

const lenderTopics = [
  { label: 'Settle this loan', type: 'settlement' as TopicType, icon: 'handshake-o', color: '#4A3AFF', bg: '#F0EDFF', threadType: 'Settlement', threadIcon: '🤝', route: '/chat/settlement' },
  { label: 'Legal notice received', type: 'legal' as TopicType, icon: 'gavel', color: '#DC2626', bg: '#FEE2E2', threadType: 'Legal Notice', threadIcon: '⚖️', route: '/chat/legal' },
  { label: 'Harassment calls', type: 'harassment' as TopicType, icon: 'phone', color: '#059669', bg: '#D1FAE5', threadType: 'Harassment', threadIcon: '📞', route: '/(tabs)/neytra' },
  { label: 'Recovery agent visited', type: 'recovery' as TopicType, icon: 'shield', color: '#EA580C', bg: '#FED7AA', threadType: 'Recovery Visit', threadIcon: '🛡️', route: '/chat/risi-hub' },
]

const generalTopics = [
  { label: 'Improve my credit score', icon: 'line-chart', color: '#7C3AED', bg: '#EDE9FE', threadTitle: 'General — Score Improvement', threadIcon: '📈', route: '/chat/score-improvement' },
  { label: 'Explain my credit report', icon: 'file-text-o', color: '#D97706', bg: '#FEF3C7', threadTitle: 'General — Credit Report', threadIcon: '📋', route: '/(tabs)/report' },
]

/* ── Smart categorization ── */
const KEYWORDS: { patterns: string[]; type: TopicType }[] = [
  { patterns: ['settle', 'settlement', 'closure', 'close loan', 'one time', 'ots', 'negotiate'], type: 'settlement' },
  { patterns: ['legal', 'notice', 'section', 'court', 'arbitration', 'ni act'], type: 'legal' },
  { patterns: ['harass', 'call', 'calling', 'threatening', 'abuse', 'rude'], type: 'harassment' },
  { patterns: ['agent', 'visit', 'came home', 'doorstep', 'recovery agent'], type: 'recovery' },
  { patterns: ['score', 'cibil', 'credit score', 'improve', 'increase score'], type: 'score' },
  { patterns: ['report', 'credit report', 'experian', 'explain'], type: 'report' },
]

function categorize(text: string): TopicType | null {
  const lower = text.toLowerCase()
  for (const kw of KEYWORDS) { if (kw.patterns.some((p) => lower.includes(p))) return kw.type }
  return null
}

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

/* ── Main ── */

export default function NewConversationScreen() {
  const router = useRouter()
  const { preselect } = useLocalSearchParams<{ preselect?: string }>()
  const addConversation = useConversationStore((s) => s.addConversation)
  const [customText, setCustomText] = useState('')

  // Auto-select topic if coming from onboarding
  const preselectedTopic = preselect ? lenderTopics.find((t) => t.type === preselect) || null : null
  const [pendingTopic, setPendingTopic] = useState<typeof lenderTopics[0] | null>(preselectedTopic)
  const [userMessage, setUserMessage] = useState<string | null>(preselectedTopic?.label || null)

  const handleLenderTopic = (topic: typeof lenderTopics[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setUserMessage(topic.label)
    setPendingTopic(topic)
  }

  const handleLenderSelect = (lender: typeof lenders[0]) => {
    if (!pendingTopic) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const threadPath = `chat/thread?lender=${encodeURIComponent(lender.name)}&type=${pendingTopic.type}`
    addConversation(
      `${lender.name} — ${pendingTopic.threadType}`,
      `${pendingTopic.label} · ${lender.sub}`,
      pendingTopic.threadIcon,
      threadPath
    )
    router.push({ pathname: '/chat/thread', params: { lender: lender.name, type: pendingTopic.type, userMsg: userMessage || undefined } } as any)
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
      const topic = lenderTopics.find((t) => t.type === category)!
      setUserMessage(text)
      setPendingTopic(topic)
      setCustomText('')
    } else {
      addConversation('General — Support', text, '👤', 'chat/risi-hub')
      setCustomText(''); router.push('/chat/risi-hub')
    }
  }

  const showChat = !!pendingTopic

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => { if (showChat) { setPendingTopic(null); setUserMessage(null) } else router.replace('/(tabs)') }} style={s.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{showChat ? 'Select lender' : 'New conversation'}</Text>
          <View style={{ width: 36 }} />
        </View>

        {!showChat ? (
          /* ── Topic selection ── */
          <>
            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Hero */}
              <View style={s.heroCard}>
                <View style={s.heroGradient} />
                <View style={s.heroOrbBg} />
                <View style={s.heroRow}>
                  <View style={s.risiLogoWrap}><Image source={require('@/assets/risi-nav.png')} style={s.risiLogo} resizeMode="contain" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.risiName}>Risi</Text>
                    <Text style={s.risiTagline}>Your loan resolution assistant</Text>
                  </View>
                  <View style={s.onlinePill}><View style={s.onlineDot} /><Text style={s.onlineText}>Online</Text></View>
                </View>
                <View style={s.heroDivider} />
                <Text style={s.heroQuestion}>How can I help you today?</Text>
                <Text style={s.heroSub}>Pick a topic or type anything — I'm here to listen, not judge.</Text>
              </View>

              <View style={s.sectionRow}><View style={s.sectionDot} /><Text style={s.sectionLabel}>Loan-related</Text></View>
              <View style={s.gridWrap}>
                {lenderTopics.map((item, i) => (
                  <TouchableOpacity key={i} style={s.gridCard} activeOpacity={0.8} onPress={() => handleLenderTopic(item)}>
                    <View style={[s.gridIcon, { backgroundColor: item.bg }]}><FontAwesome name={item.icon as any} size={16} color={item.color} /></View>
                    <Text style={s.gridLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[s.sectionRow, { marginTop: 20 }]}><View style={s.sectionDot} /><Text style={s.sectionLabel}>General</Text></View>
              <View style={s.gridWrap}>
                {generalTopics.map((item, i) => (
                  <TouchableOpacity key={i} style={s.gridCard} activeOpacity={0.8} onPress={() => handleGeneralTopic(item)}>
                    <View style={[s.gridIcon, { backgroundColor: item.bg }]}><FontAwesome name={item.icon as any} size={16} color={item.color} /></View>
                    <Text style={s.gridLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.trustRow}><FontAwesome name="lock" size={9} color={Colors.textMuted} /><Text style={s.trustText}>Private & encrypted · Nothing is shared</Text></View>
            </ScrollView>

            {/* Input bar */}
            <View style={s.inputBar}>
              <View style={s.inputWrap}>
                <TextInput style={s.input} placeholder="Type your question..." placeholderTextColor={Colors.textMuted} value={customText} onChangeText={setCustomText} returnKeyType="send" onSubmitEditing={handleCustomSubmit} />
                {customText.trim() ? (
                  <TouchableOpacity style={s.sendBtn} onPress={handleCustomSubmit}><FontAwesome name="arrow-right" size={14} color={Colors.white} /></TouchableOpacity>
                ) : (
                  <TouchableOpacity style={s.micBtn}><FontAwesome name="microphone" size={16} color={Colors.primary} /></TouchableOpacity>
                )}
              </View>
            </View>
          </>
        ) : (
          /* ── Chat with lender picker inline ── */
          <ScrollView contentContainerStyle={s.chatContent} showsVerticalScrollIndicator={false}>
            <UserBubble text={userMessage || pendingTopic.label} />

            <BotBubble>
              <Text style={s.botText}>
                I can help you with that. Which lender is this regarding?
              </Text>
              <View style={s.lenderList}>
                {lenders.map((lender, i) => (
                  <TouchableOpacity key={i} style={s.lenderCard} activeOpacity={0.8} onPress={() => handleLenderSelect(lender)}>
                    <View style={s.lenderIcon}><FontAwesome name="university" size={14} color={Colors.primary} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.lenderName}>{lender.name}</Text>
                      <Text style={s.lenderSub}>{lender.sub}</Text>
                    </View>
                    {lender.dpd > 0 && (
                      <View style={[s.dpdPill, lender.dpd > 90 ? s.dpdSevere : lender.dpd > 30 ? s.dpdModerate : s.dpdMild]}>
                        <Text style={[s.dpdText, lender.dpd > 90 ? s.dpdTextSevere : lender.dpd > 30 ? s.dpdTextModerate : s.dpdTextMild]}>
                          {lender.dpd > 90 ? `Overdue ${Math.round(lender.dpd / 30)}m` : `Late ${lender.dpd}d`}
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

const CARD_GAP = 10
const CARD_W = (width - 32 - CARD_GAP) / 2

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Hero
  heroCard: { backgroundColor: '#F0EDFF', borderRadius: 22, padding: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#DDD8FF' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 70, backgroundColor: '#E8E3FF', borderTopLeftRadius: 22, borderTopRightRadius: 22, opacity: 0.7 },
  heroOrbBg: { position: 'absolute', top: -25, right: -25, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(74,58,255,0.06)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  risiLogoWrap: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  risiLogo: { width: 44, height: 44, borderRadius: 22 },
  risiName: { fontSize: 22, fontFamily: 'Caveat_700Bold', color: '#4A3AFF', letterSpacing: 0.5 },
  risiTagline: { fontSize: 11, color: '#8B7FCC', marginTop: 1 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(74,58,255,0.06)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#E0DBFF' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 11, fontWeight: '600', color: '#8B7FCC' },
  heroDivider: { height: 1, backgroundColor: '#DDD8FF', marginBottom: 14, marginHorizontal: -20 },
  heroQuestion: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#8B7FCC', lineHeight: 19 },

  // Section
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.primary },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  // Grid
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  gridCard: { width: CARD_W, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F0F0F5' },
  gridIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gridLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, lineHeight: 18 },

  // Trust
  trustRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 },
  trustText: { fontSize: 10, color: Colors.textMuted },

  // Input bar
  inputBar: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingLeft: 16, paddingRight: 5, height: 50, borderWidth: 1.5, borderColor: '#E5E7EB' },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  micBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },

  // Chat bubbles
  chatContent: { padding: 16 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%' },
  userText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  botAvatarWrap: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
  botAvatarImg: { width: 30, height: 30, borderRadius: 15 },
  botBubble: { backgroundColor: '#F9FAFB', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, flex: 1 },
  botText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },

  // Lender list inside chat
  lenderList: { marginTop: 12, gap: 6 },
  lenderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  lenderIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center' },
  lenderName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  lenderSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  dpdPill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  dpdSevere: { backgroundColor: '#FEE2E2' },
  dpdModerate: { backgroundColor: '#FED7AA' },
  dpdMild: { backgroundColor: '#FEF3C7' },
  dpdText: { fontSize: 9, fontWeight: '700' },
  dpdTextSevere: { color: '#DC2626' },
  dpdTextModerate: { color: '#EA580C' },
  dpdTextMild: { color: '#D97706' },
})
