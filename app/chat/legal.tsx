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

/* ── File Upload with Progress ── */

function FileUpload({ onComplete }: { onComplete: () => void }) {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1, duration: 2500, easing: Easing.out(Easing.ease), useNativeDriver: false,
    }).start(() => onComplete())
  }, [])

  const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
  const percentText = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 100] })

  return (
    <View style={styles.uploadCard}>
      <View style={styles.uploadHeader}>
        <FontAwesome name="file-pdf-o" size={20} color={Colors.alert} />
        <View style={styles.uploadInfo}>
          <Text style={styles.uploadName}>Legal_Notice_HDFC.pdf</Text>
          <Text style={styles.uploadSize}>245 KB</Text>
        </View>
        <FontAwesome name="check-circle" size={18} color={Colors.success} />
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: widthInterp }]} />
      </View>
    </View>
  )
}

/* ── Main Screen ── */

export default function LegalChatScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTyping(true); scrollToEnd()
      setTimeout(() => {
        setTyping(false); setStep(1); setShowUpload(true); scrollToEnd()
      }, 1500)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleUploadComplete = () => {
    setShowUpload(false)
    setTyping(true); scrollToEnd()
    setTimeout(() => { setTyping(false); setStep(2); scrollToEnd() }, 1500)
  }

  const handleDraftReply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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
        <Text style={styles.headerTitle}>Legal Notice Assistant</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
        {/* Step 0 */}
        <UserBubble text="I received a legal notice" />

        {/* Step 1 */}
        {step >= 1 && (
          <BotBubble>
            <Text style={styles.botText}>
              I understand this can be stressful. Let me analyze the legal notice for you.{'\n\n'}Please upload the notice so I can review it:
            </Text>
          </BotBubble>
        )}

        {showUpload && <FileUpload onComplete={handleUploadComplete} />}

        {/* Step 2: Analysis */}
        {step >= 2 && (
          <BotBubble>
            {(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return null; })()}
            <Text style={styles.botText}>I've analyzed the legal notice. Here's a summary:</Text>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Legal Notice Summary</Text>
              {[
                { label: 'Type', value: 'EMI Bounce Notice' },
                { label: 'Section', value: 'Section 25 - NI Act' },
                { label: 'Amount Claimed', value: '\u20B986,200' },
                { label: 'Response Deadline', value: '13 days left' },
                { label: 'Bank', value: 'HDFC Bank' },
              ].map((row, i) => (
                <View key={i} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={[styles.summaryValue, row.label === 'Response Deadline' && { color: Colors.alert }]}>{row.value}</Text>
                </View>
              ))}
            </Card>
            <View style={styles.warningBox}>
              <FontAwesome name="exclamation-triangle" size={14} color={Colors.warningText} />
              <Text style={styles.warningText}>
                This notice requires a timely response. Ignoring it may lead to further legal proceedings.
              </Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleDraftReply} activeOpacity={0.8}>
              <FontAwesome name="pencil" size={14} color={Colors.white} />
              <Text style={styles.primaryBtnText}>Draft my Reply</Text>
            </TouchableOpacity>
          </BotBubble>
        )}

        {/* Step 3: Reply draft */}
        {step >= 3 && (
          <BotBubble>
            <Text style={styles.botText}>Here's your drafted reply:</Text>
            <Card style={styles.draftCard}>
              <Text style={styles.draftBody}>
                To,{'\n'}The Manager,{'\n'}HDFC Bank, Recovery Department{'\n\n'}Subject: Reply to Legal Notice dated 01/06/2026{'\n\n'}Dear Sir/Madam,{'\n\n'}I acknowledge receipt of your legal notice regarding my loan account XXXX-1234 with an outstanding of {'\u20B9'}86,200.{'\n\n'}I wish to bring to your notice that I am facing genuine financial hardship due to loss of employment. I am willing to settle the matter amicably.{'\n\n'}I request you to consider a one-time settlement or EMI restructuring. I am available for discussion at your convenience.{'\n\n'}I also wish to highlight that any recovery actions must be in compliance with RBI guidelines on Fair Practices Code.{'\n\n'}Regards,{'\n'}Sunil Singh{'\n'}Ph: 7742147525
              </Text>
            </Card>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSend} activeOpacity={0.8}>
              <FontAwesome name="send" size={14} color={Colors.white} />
              <Text style={styles.primaryBtnText}>Review & Send</Text>
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
            <Text style={[styles.botText, { textAlign: 'center', fontWeight: '600', marginBottom: 4 }]}>
              Reply sent successfully!
            </Text>
            <Text style={[styles.botText, { textAlign: 'center', fontSize: 13, color: Colors.textSecondary }]}>
              Your reply has been sent to HDFC Bank's recovery team via registered email. A copy has been saved to your records.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16 }]}
              onPress={() => router.push('/chat/risi-hub')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Back to Risi</Text>
            </TouchableOpacity>
          </BotBubble>
        )}

        {typing && <TypingIndicator />}
      </ScrollView>

      {/* Quick replies */}
      <View style={styles.quickReplies}>
        {step === 2 && (
          <>
            <TouchableOpacity style={styles.chip} onPress={() => Haptics.selectionAsync()}><Text style={styles.chipText}>Is this notice valid?</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => Haptics.selectionAsync()}><Text style={styles.chipText}>Can they arrest me?</Text></TouchableOpacity>
          </>
        )}
        {step === 4 && (
          <TouchableOpacity style={styles.chip} onPress={() => { Haptics.selectionAsync(); router.push('/chat/settlement'); }}>
            <Text style={styles.chipText}>Explore settlement options</Text>
          </TouchableOpacity>
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
  uploadCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  uploadHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  uploadInfo: { flex: 1 },
  uploadName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  uploadSize: { fontSize: 11, color: Colors.textMuted },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.primary },
  summaryCard: { marginTop: 12, backgroundColor: Colors.bgPage },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  warningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.warningBg, borderRadius: 10, padding: 12, marginTop: 12,
  },
  warningText: { flex: 1, fontSize: 12, color: Colors.warningText, lineHeight: 17 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, marginTop: 12,
  },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  draftCard: { marginTop: 12, backgroundColor: Colors.bgPage },
  draftBody: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  successIcon: { alignItems: 'center', marginBottom: 12 },
  quickReplies: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white,
  },
  chip: { backgroundColor: Colors.chipBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
})
