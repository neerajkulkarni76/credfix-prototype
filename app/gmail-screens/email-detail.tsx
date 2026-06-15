import React, { useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Easing, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '@/constants/Colors'
import { lenderEmails, EmailCategory } from '@/data/mockData'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

const CATEGORY_COLORS: Record<EmailCategory, { bg: string; text: string; icon: string }> = {
  'Collection Reminder': { bg: '#FEE2E2', text: '#DC2626', icon: 'exclamation-triangle' },
  'Repayment Reminder': { bg: '#FEF3C7', text: '#D97706', icon: 'clock-o' },
  'Legal Notice': { bg: '#FEE2E2', text: '#DC2626', icon: 'gavel' },
  'NOC': { bg: '#D1FAE5', text: '#059669', icon: 'check-circle' },
  'Settlement Offer': { bg: '#EDE9FE', text: '#7C3AED', icon: 'handshake-o' },
  'Closure Confirmation': { bg: '#D1FAE5', text: '#059669', icon: 'check-circle' },
}

const CTA_CONFIG: Record<EmailCategory, { primary: string; secondary: string; primaryRoute: string; secondaryRoute: string }> = {
  'Collection Reminder': { primary: 'Ask Risi to help', secondary: 'Explore settlement', primaryRoute: 'chat/risi-hub', secondaryRoute: 'chat/settlement' },
  'Repayment Reminder': { primary: 'Ask Risi to help', secondary: 'Set up payment', primaryRoute: 'chat/risi-hub', secondaryRoute: 'chat/risi-hub' },
  'Legal Notice': { primary: 'Get legal help from Risi', secondary: 'Draft a reply', primaryRoute: 'chat/legal', secondaryRoute: 'chat/legal' },
  'NOC': { primary: 'Download NOC', secondary: 'Verify with Risi', primaryRoute: 'chat/risi-hub', secondaryRoute: 'chat/risi-hub' },
  'Settlement Offer': { primary: 'Review with Risi', secondary: 'Accept offer', primaryRoute: 'chat/settlement', secondaryRoute: 'chat/settlement' },
  'Closure Confirmation': { primary: 'Download certificate', secondary: 'Check credit impact', primaryRoute: 'chat/risi-hub', secondaryRoute: 'chat/risi-hub' },
}

export default function EmailDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const email = lenderEmails.find((e) => e.id === Number(id))

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start()
  }, [])

  if (!email) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email not found</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>
    )
  }

  const cat = CATEGORY_COLORS[email.category]
  const cta = CTA_CONFIG[email.category]

  const handlePrimary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (email.hasRisiThread && email.risiThreadPath) {
      router.push(`/${email.risiThreadPath}` as any)
    } else {
      router.push(`/${cta.primaryRoute}` as any)
    }
  }

  const handleSecondary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/${cta.secondaryRoute}` as any)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Email</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Category + critical banner */}
          {email.critical && (
            <View style={styles.criticalBanner}>
              <FontAwesome name="exclamation-circle" size={14} color="#DC2626" />
              <Text style={styles.criticalBannerText}>
                This email requires your immediate attention
              </Text>
            </View>
          )}

          {/* Subject */}
          <Text style={styles.subject}>{email.subject}</Text>

          {/* Category pill */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: cat.bg }]}>
              <FontAwesome name={cat.icon as any} size={10} color={cat.text} />
              <Text style={[styles.categoryPillText, { color: cat.text }]}>{email.category}</Text>
            </View>
            <Text style={styles.dateText}>{email.date}, {email.time}</Text>
          </View>

          {/* Sender info */}
          <View style={styles.senderCard}>
            <View style={styles.senderAvatar}>
              <Text style={styles.senderInitial}>{email.lender[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.senderName}>{email.lender}</Text>
              <Text style={styles.senderEmail}>{email.from}</Text>
            </View>
            <View style={styles.toYouPill}>
              <Text style={styles.toYouText}>to me</Text>
              <FontAwesome name="caret-down" size={10} color={Colors.textMuted} />
            </View>
          </View>

          {/* Risi insight — if thread exists */}
          {email.hasRisiThread && (
            <TouchableOpacity style={styles.risiInsight} onPress={handlePrimary} activeOpacity={0.8}>
              <View style={styles.risiInsightHeader}>
                <View style={styles.risiInsightDot} />
                <Text style={styles.risiInsightLabel}>RISI INSIGHT</Text>
              </View>
              <Text style={styles.risiInsightText}>
                {email.category === 'Legal Notice'
                  ? "I've reviewed this notice. You have legal options — I can draft a reply and explain your rights."
                  : email.category === 'Settlement Offer'
                  ? "This looks like a genuine offer. I can help you evaluate if it's a good deal and negotiate further."
                  : email.category === 'Collection Reminder'
                  ? "Some of the language in this email may violate RBI guidelines. I can help you respond appropriately."
                  : "I'm tracking this for you. Tap to see the full thread and next steps."
                }
              </Text>
              <View style={styles.risiInsightCta}>
                <Text style={styles.risiInsightCtaText}>View Risi thread</Text>
                <FontAwesome name="arrow-right" size={11} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          )}

          {/* Email body */}
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{email.body}</Text>
          </View>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <View style={styles.attachSection}>
              <Text style={styles.attachTitle}>
                <FontAwesome name="paperclip" size={13} color={Colors.textSecondary} />
                {'  '}{email.attachments.length} Attachment{email.attachments.length > 1 ? 's' : ''}
              </Text>
              {email.attachments.map((att, i) => (
                <TouchableOpacity key={i} style={styles.attachCard} activeOpacity={0.7}>
                  <View style={styles.attachIcon}>
                    <FontAwesome name="file-pdf-o" size={18} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachName} numberOfLines={1}>{att.name}</Text>
                    <Text style={styles.attachSize}>{att.size}</Text>
                  </View>
                  <TouchableOpacity style={styles.attachDownload} activeOpacity={0.7}>
                    <FontAwesome name="download" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* What Risi can do — for non-threaded emails */}
          {!email.hasRisiThread && (
            <View style={styles.risiHelpCard}>
              <View style={styles.risiHelpHeader}>
                <View style={styles.risiHelpDot} />
                <Text style={styles.risiHelpLabel}>How Risi can help</Text>
              </View>
              {email.category === 'Repayment Reminder' && (
                <View style={styles.risiHelpItems}>
                  <HelpItem icon="calendar" text="Set up a payment plan that fits your budget" />
                  <HelpItem icon="comments" text="Negotiate with the lender for more time" />
                  <HelpItem icon="shield" text="Check if any charges violate RBI guidelines" />
                </View>
              )}
              {email.category === 'Collection Reminder' && (
                <View style={styles.risiHelpItems}>
                  <HelpItem icon="gavel" text="Check for RBI guideline violations in the notice" />
                  <HelpItem icon="handshake-o" text="Explore one-time settlement options" />
                  <HelpItem icon="file-text-o" text="Draft a formal response to the lender" />
                </View>
              )}
              {email.category === 'NOC' && (
                <View style={styles.risiHelpItems}>
                  <HelpItem icon="download" text="Save your NOC securely for future reference" />
                  <HelpItem icon="line-chart" text="Check how this affects your credit score" />
                  <HelpItem icon="check-circle" text="Verify your credit bureau records are updated" />
                </View>
              )}
              {email.category === 'Settlement Offer' && (
                <View style={styles.risiHelpItems}>
                  <HelpItem icon="calculator" text="Evaluate if this settlement is a good deal" />
                  <HelpItem icon="comments" text="Negotiate for a better offer" />
                  <HelpItem icon="file-text-o" text="Get the offer in writing before paying" />
                </View>
              )}
              {email.category === 'Closure Confirmation' && (
                <View style={styles.risiHelpItems}>
                  <HelpItem icon="download" text="Download and save closure documents" />
                  <HelpItem icon="line-chart" text="Understand credit score impact" />
                  <HelpItem icon="check-circle" text="Ensure credit bureau records are updated" />
                </View>
              )}
              {email.category === 'Legal Notice' && (
                <View style={styles.risiHelpItems}>
                  <HelpItem icon="gavel" text="Understand your legal rights and options" />
                  <HelpItem icon="file-text-o" text="Draft a legal reply with proper sections" />
                  <HelpItem icon="shield" text="Check if the notice has procedural issues" />
                </View>
              )}
            </View>
          )}

        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryCta} onPress={handleSecondary} activeOpacity={0.8}>
          <Text style={styles.secondaryCtaText}>{cta.secondary}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryCta} onPress={handlePrimary} activeOpacity={0.8}>
          <View style={styles.primaryCtaDot} />
          <Text style={styles.primaryCtaText}>{cta.primary}</Text>
          <FontAwesome name="arrow-right" size={12} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function HelpItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.helpItem}>
      <View style={styles.helpItemIcon}>
        <FontAwesome name={icon as any} size={13} color={Colors.primary} />
      </View>
      <Text style={styles.helpItemText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: 20 },

  // Critical banner
  criticalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  criticalBannerText: { fontSize: 13, fontWeight: '600', color: '#DC2626', flex: 1 },

  // Subject
  subject: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28, marginBottom: 12 },

  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  categoryPillText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: Colors.textMuted },

  // Sender
  senderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 16,
  },
  senderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  senderInitial: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  senderName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  senderEmail: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  toYouPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  toYouText: { fontSize: 11, color: Colors.textMuted },

  // Risi insight
  risiInsight: {
    backgroundColor: '#F8F7FF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#E8E6FF',
  },
  risiInsightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  risiInsightDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary },
  risiInsightLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  risiInsightText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  risiInsightCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  risiInsightCtaText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Body
  bodyCard: {
    backgroundColor: '#FAFAFA', borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  bodyText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },

  // Attachments
  attachSection: { marginBottom: 16 },
  attachTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  attachCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#F0F0F5',
  },
  attachIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  attachName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  attachSize: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  attachDownload: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center' },

  // Risi help card
  risiHelpCard: {
    backgroundColor: '#F8F7FF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#E8E6FF',
  },
  risiHelpHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  risiHelpDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary },
  risiHelpLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  risiHelpItems: { gap: 10 },
  helpItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  helpItemIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center' },
  helpItemText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 19 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  secondaryCta: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  secondaryCtaText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  primaryCta: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 14, backgroundColor: Colors.primary,
  },
  primaryCtaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  primaryCtaText: { fontSize: 14, fontWeight: '700', color: Colors.white },
})
