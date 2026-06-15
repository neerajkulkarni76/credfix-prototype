import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import { callHistory } from '@/data/mockData'

export default function CallHistoryScreen() {
  const router = useRouter()

  const sections = useMemo(() => {
    const groups: Record<string, typeof callHistory> = {}
    callHistory.forEach((call) => {
      if (!groups[call.date]) groups[call.date] = []
      groups[call.date].push(call)
    })
    return Object.entries(groups).map(([title, data]) => ({ title, data }))
  }, [])

  const statusColor = (status: string) => {
    if (status === 'handled') return Colors.alert
    if (status === 'allowed') return Colors.success
    return Colors.alertOrange
  }

  const statusLabel = (status: string) => {
    if (status === 'handled') return 'Handled by Neytra'
    if (status === 'allowed') return 'Allowed'
    return 'Verify'
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <FontAwesome name="sliders" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.dateHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Card
            style={styles.callCard}
            onPress={() => router.push('/neytra-screens/insights')}
          >
            <View style={styles.callRow}>
              <View style={[styles.phoneIcon, { backgroundColor: statusColor(item.status) + '18' }]}>
                <FontAwesome
                  name={item.status === 'allowed' ? 'phone' : 'phone-square'}
                  size={16}
                  color={statusColor(item.status)}
                />
              </View>
              <View style={styles.callInfo}>
                <Text style={styles.callNumber}>{item.number}</Text>
                <Text style={styles.callTime}>{item.time}</Text>
              </View>
              <View style={styles.callRight}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '18' }]}>
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
                {item.bank && (
                  <View style={styles.bankTag}>
                    <Text style={styles.bankTagText}>{item.bank}</Text>
                  </View>
                )}
                {!item.bank && item.extra && (
                  <Text style={styles.extraText}>{item.extra}</Text>
                )}
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPage },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  dateHeader: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 16, marginBottom: 10, paddingLeft: 4 },
  callCard: { marginBottom: 8 },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  callInfo: { flex: 1 },
  callNumber: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  callTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  callRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },
  bankTag: { backgroundColor: Colors.chipBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  bankTagText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  extraText: { fontSize: 11, color: Colors.textMuted },
})
