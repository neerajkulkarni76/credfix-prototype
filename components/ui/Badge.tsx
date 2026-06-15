import { View, Text, StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'

const variants = {
  Active: { bg: '#F0FDF4', text: Colors.success, border: '#BBF7D0' },
  Sent: { bg: '#F3F4F6', text: Colors.textSecondary, border: Colors.border },
  'In progress': { bg: '#1F2937', text: Colors.white, border: '#1F2937' },
  Review: { bg: '#FFF7ED', text: Colors.alertOrange, border: '#FED7AA' },
}

export function Badge({ status }: { status: string }) {
  const v = variants[status as keyof typeof variants] || variants.Sent
  return (
    <View style={[styles.badge, { backgroundColor: v.bg, borderColor: v.border }]}>
      <Text style={[styles.label, { color: v.text }]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '600' },
})
