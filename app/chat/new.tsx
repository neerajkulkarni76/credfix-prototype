import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { useConversationStore } from '@/stores/conversationStore'
import * as Haptics from 'expo-haptics'

const suggestions = [
  { label: 'I received a collection call', icon: '📞', route: '/chat/settlement', chatIcon: '📞' },
  { label: 'How much can I save through settlement?', icon: '💰', route: '/chat/settlement', chatIcon: '💰' },
  { label: 'Help me settle a loan', icon: '🤝', route: '/chat/settlement', chatIcon: '🤝' },
  { label: 'Analyze my lender communication', icon: '📊', route: '/neytra-screens/insights', chatIcon: '📊' },
  { label: 'Explain my credit report', icon: '📋', route: '/(tabs)/report', chatIcon: '📋' },
  { label: 'How can I improve my credit score?', icon: '📈', route: '/(tabs)', chatIcon: '📈' },
]

export default function NewConversationScreen() {
  const router = useRouter()
  const addConversation = useConversationStore((s) => s.addConversation)
  const [customText, setCustomText] = useState('')

  const startConversation = (title: string, icon: string, route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    addConversation(title, 'Started just now', icon, route.replace('/', ''))
    router.push(route as any)
  }

  const handleCustomSubmit = () => {
    if (!customText.trim()) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Keyboard.dismiss()
    addConversation(customText.trim(), 'Started just now', '💬', 'chat/settlement')
    setCustomText('')
    router.push('/chat/settlement')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New conversation</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Prompt */}
          <View style={styles.promptSection}>
            <View style={styles.credFixIcon}>
              <Text style={styles.credFixText}>C+</Text>
            </View>
            <Text style={styles.promptTitle}>What's on your mind?</Text>
            <Text style={styles.promptSubtitle}>
              Choose a topic below or type your own question
            </Text>
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsWrap}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionBtn}
                activeOpacity={0.7}
                onPress={() => startConversation(s.label, s.chatIcon, s.route)}
              >
                <Text style={styles.suggestionIcon}>{s.icon}</Text>
                <Text style={styles.suggestionLabel}>{s.label}</Text>
                <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Input */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask Risi anything..."
              placeholderTextColor={Colors.textMuted}
              value={customText}
              onChangeText={setCustomText}
              returnKeyType="send"
              onSubmitEditing={handleCustomSubmit}
            />
            {customText.trim() ? (
              <TouchableOpacity style={styles.sendBtn} onPress={handleCustomSubmit}>
                <FontAwesome name="send" size={14} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micBtn}>
                <FontAwesome name="microphone" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPage },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  promptSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 32 },
  credFixIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  credFixText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  promptTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  promptSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  suggestionsWrap: { gap: 10 },
  suggestionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  suggestionIcon: { fontSize: 20 },
  suggestionLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  inputBar: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgPage,
    borderRadius: 24, paddingHorizontal: 16, height: 48,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  micBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
})
