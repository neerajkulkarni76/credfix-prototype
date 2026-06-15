import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { Card } from '@/components/ui/Card'
import * as Haptics from 'expo-haptics'

const WAVEFORM_BARS = [4, 8, 14, 6, 12, 18, 10, 16, 8, 20, 12, 6, 14, 10, 18, 8, 14, 6, 10, 16, 12, 8, 14, 20, 10]

const discussionPoints = [
  'Agent asked about repayment of personal loan of \u20B986,200',
  'Offered a one-time settlement at \u20B950,000',
  'Mentioned deadline of 15 June 2026 for settlement',
  'No threats or harassment language used',
  'Agent confirmed NOC will be provided post-settlement',
]

export default function CallInsightsScreen() {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call Insights</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Call info */}
        <View style={styles.callInfo}>
          <Text style={styles.callNumber}>+91 1408 858 481</Text>
          <Text style={styles.callDate}>Today, 2:26 PM  ·  4 min 32 sec</Text>
        </View>

        {/* Audio Player */}
        <View style={styles.audioCard}>
          <View style={styles.playerRow}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsPlaying(!isPlaying); }}
              activeOpacity={0.8}
            >
              <FontAwesome name={isPlaying ? 'pause' : 'play'} size={16} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.waveform}>
              {WAVEFORM_BARS.map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h }]} />
              ))}
            </View>
            <Text style={styles.duration}>4:32</Text>
          </View>
        </View>

        {/* Tone Badge */}
        <View style={styles.toneRow}>
          <Text style={styles.toneLabel}>Tone Analysis</Text>
          <View style={styles.toneBadge}>
            <FontAwesome name="check-circle" size={12} color={Colors.success} />
            <Text style={styles.toneText}>Calm - No harassment detected</Text>
          </View>
        </View>

        {/* Info Rows */}
        <Card style={styles.infoCard}>
          {[
            { label: 'BANK', value: 'HDFC Bank' },
            { label: 'DISCUSSION', value: 'Loan Settlement' },
            { label: 'LOAN AMOUNT', value: '\u20B986,200' },
            { label: 'OFFERED', value: '\u20B950,000' },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, i < 3 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        {/* Discussion Points */}
        <View style={styles.discussionSection}>
          <Text style={styles.discussionTitle}>WHAT WAS DISCUSSED</Text>
          <View style={styles.discussionCard}>
            {discussionPoints.map((point, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.8}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/chat/risi-hub'); }}
        >
          <View style={styles.ctaIcon}>
            <Text style={styles.ctaIconText}>C+</Text>
          </View>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>Plan your next steps with Risi</Text>
            <Text style={styles.ctaSubtitle}>Get personalized advice on this settlement offer</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: { padding: 16, paddingBottom: 32 },
  callInfo: { alignItems: 'center', marginBottom: 20 },
  callNumber: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  callDate: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  audioCard: {
    backgroundColor: Colors.neytraDark, borderRadius: 16, padding: 16, marginBottom: 20,
  },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 24 },
  waveBar: { width: 3, borderRadius: 1.5, backgroundColor: Colors.primary, opacity: 0.7 },
  duration: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  toneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  toneLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  toneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  toneText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  infoCard: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  discussionSection: { marginBottom: 24 },
  discussionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, marginBottom: 10 },
  discussionCard: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#BBF7D0', gap: 10,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success, marginTop: 5 },
  bulletText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary, borderRadius: 16, padding: 16,
  },
  ctaIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  ctaIconText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  ctaTextWrap: { flex: 1 },
  ctaTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  ctaSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
})
