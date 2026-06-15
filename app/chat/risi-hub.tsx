import React from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useConversationStore, Conversation } from '@/stores/conversationStore'

export default function RisiHubScreen() {
  const router = useRouter()
  const conversations = useConversationStore((s) => s.conversations)

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Card
      style={styles.conversationCard}
      onPress={() => router.push(`/${item.path}` as any)}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={styles.badgeRow}>
            <Badge status={item.status} />
          </View>
        </View>
      </View>
    </Card>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your financial companion</Text>
          <View style={{ width: 36 }} />
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderConversation}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Greeting Card */}
              <Card style={styles.greetingCard}>
                <View style={styles.greetingRow}>
                  <View style={styles.credFixIcon}>
                    <Text style={styles.credFixText}>C+</Text>
                  </View>
                  <View style={styles.greetingTextWrap}>
                    <Text style={styles.greetingTitle}>Hey Sunil {'👋'}</Text>
                    <Text style={styles.greetingSubtitle}>
                      I'm Risi, your AI-powered financial companion. Let me help you take control of your debt.
                    </Text>
                  </View>
                </View>
              </Card>

              {/* New Conversation Button */}
              <TouchableOpacity
                style={styles.newConvoBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/chat/new')}
              >
                <FontAwesome name="plus" size={14} color={Colors.white} />
                <Text style={styles.newConvoBtnText}>Start a new conversation</Text>
              </TouchableOpacity>

              {/* Section Header */}
              <Text style={styles.sectionTitle}>Recent conversations</Text>
            </>
          }
        />
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
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  greetingCard: { marginBottom: 16, backgroundColor: Colors.primaryLight },
  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  credFixIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  credFixText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  greetingTextWrap: { flex: 1 },
  greetingTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  greetingSubtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  newConvoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, marginBottom: 24,
  },
  newConvoBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  conversationCard: { marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  iconEmoji: { fontSize: 18 },
  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  cardSubtitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  badgeRow: { flexDirection: 'row' },
})
