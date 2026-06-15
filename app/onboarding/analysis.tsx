import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

async function speak(text: string, onFinished: () => void, muted: boolean) {
  if (muted) {
    const words = text.split(/\s+/).length;
    setTimeout(onFinished, Math.max(words * 380, 3000));
    return;
  }

  // Force stop any prior speech to reset engine state
  try { await Speech.stop(); } catch {}

  let done = false;
  const finish = () => { if (!done) { done = true; onFinished(); } };

  const words = text.split(/\s+/).length;
  const fallbackMs = Math.max(words * 450, 5000);
  const fallbackTimer = setTimeout(finish, fallbackMs);

  // Poll as backup — starts after 2s
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  setTimeout(() => {
    pollTimer = setInterval(async () => {
      try {
        const speaking = await Speech.isSpeakingAsync();
        if (!speaking && !done) {
          if (pollTimer) clearInterval(pollTimer);
          clearTimeout(fallbackTimer);
          finish();
        }
      } catch {}
    }, 500);
  }, 2000);

  // Small delay after stop to let engine reset
  setTimeout(() => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.85,
      onDone: () => {
        if (pollTimer) clearInterval(pollTimer);
        clearTimeout(fallbackTimer);
        finish();
      },
      onError: () => {
        if (pollTimer) clearInterval(pollTimer);
        clearTimeout(fallbackTimer);
        finish();
      },
    });
  }, 100);
}

// ── Scene data ──
type Scene = {
  bg: string; icon: string; iconColor: string; iconBg: string;
  title: string; lines: string[];
  detail?: { label: string; value: string }[];
  empathy?: boolean; narration: string;
};

function buildScenes(name: string, q1: string, q2: string, q3: string): Scene[] {
  const ctaLabel = q1.includes('calls') || q1.includes('harassment')
    ? 'call protection' : q1.includes('legal') || q1.includes('Legal')
      ? 'legal support' : 'settlement plan';

  return [
    {
      bg: '#F9FAFB', icon: 'hand-peace-o', iconColor: Colors.primary, iconBg: Colors.primaryLight,
      title: `Hi ${name},`,
      lines: ['Thank you for trusting us.', "Let's look at your situation together."],
      narration: `Hi ${name}... Thank you for trusting us with this... Let's look at your situation together.`,
    },
    {
      bg: '#EEF2FF', icon: 'file-text-o', iconColor: Colors.primary, iconBg: '#DDD6FE',
      title: "Here's what we found",
      lines: ['We checked your credit report', 'and identified your active loans.'],
      detail: [
        { label: 'Active loans', value: '3' },
        { label: 'Total outstanding', value: '₹2,85,600' },
        { label: 'Credit score', value: '624' },
      ],
      narration: `We checked your credit report... and found 3 active loans... with a total outstanding of 2 lakh 85 thousand rupees... Your credit score is currently at 624.`,
    },
    {
      bg: '#FFF7ED', icon: 'heart', iconColor: '#F97316', iconBg: '#FED7AA',
      title: 'We understand',
      lines: [
        q2 ? `Delays due to ${q2.toLowerCase()} are` : 'Repayment delays are',
        'more common than you think.', '',
        "You're not the only one going", 'through this — and it can be fixed.',
      ],
      empathy: true,
      narration: q2
        ? `We understand... Delays due to ${q2.toLowerCase()}... are much more common than you might think... You are not alone in this... and this can absolutely be fixed.`
        : `We understand... Repayment delays happen to lakhs of people... You are not alone... and this can absolutely be fixed.`,
    },
    {
      bg: '#FEF2F2', icon: 'envelope-open', iconColor: Colors.alert, iconBg: '#FECACA',
      title: "What needs your attention",
      lines: ['Based on your credit report,', 'you may have received legal notices', 'from 2 lenders in the last 30 days.'],
      detail: [
        { label: 'Legal notices', value: '2' },
        { label: 'Highest delay', value: '6 months' },
        { label: 'Score impact', value: 'Needs attention' },
      ],
      narration: `Based on your credit report... we believe you may have received legal notices... from 2 lenders in the last 30 days... Your highest loan delay is 6 months... and your credit score needs some attention... But here's the important part.`,
    },
    {
      bg: '#F0FDF4', icon: 'lightbulb-o', iconColor: Colors.ctaGreen, iconBg: '#BBF7D0',
      title: "Here's what we can do",
      lines: [
        q3 ? `Based on your income (${q3.toLowerCase()}),` : 'Based on your situation,',
        "we've identified a plan that works.", '',
        'You can save up to 45% on', 'your outstanding amount.',
      ],
      detail: [
        { label: 'Potential savings', value: 'Up to ₹1,28,520' },
        { label: 'Recommended plan', value: ctaLabel.charAt(0).toUpperCase() + ctaLabel.slice(1) },
      ],
      narration: q3
        ? `Here's the good news... Based on your income of ${q3.toLowerCase()}... we've identified a plan that actually works for you... You could save up to 45 percent on your total outstanding amount... That's a potential saving of over 1 lakh 28 thousand rupees.`
        : `Here's the good news... We've identified a plan that works for you... You could save up to 45 percent... That's a potential saving of over 1 lakh 28 thousand rupees.`,
    },
    {
      bg: '#EEF2FF', icon: 'rocket', iconColor: Colors.primary, iconBg: Colors.primaryLight,
      title: "We're ready when you are",
      lines: [`Your personalised ${ctaLabel}`, 'is ready to go.', '', "Let's take the first step together."],
      narration: `Your personalised ${ctaLabel} is ready... Let's take the first step together... We're with you on this.`,
    },
  ];
}

// ── Video Player ──
function VideoPlayer({ scenes, onComplete, onSkip }: { scenes: Scene[]; onComplete: () => void; onSkip: () => void }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const mutedRef = useRef(false);
  const pausedRef = useRef(false);
  const currentRef = useRef(0);
  const doneRef = useRef(false);

  const sceneFade = useRef(new Animated.Value(1)).current;
  const titleSlide = useRef(new Animated.Value(0)).current;
  const lineAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const detailAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback((i: number) => {
    sceneFade.setValue(0); titleSlide.setValue(20); iconScale.setValue(0.5);
    lineAnims.forEach(a => a.setValue(0)); detailAnims.forEach(a => a.setValue(0));

    Animated.parallel([
      Animated.timing(sceneFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(titleSlide, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();

    scenes[i].lines.forEach((_, j) => {
      setTimeout(() => Animated.timing(lineAnims[j], { toValue: 1, duration: 300, useNativeDriver: true }).start(), 400 + j * 350);
    });
    if (scenes[i].detail) {
      scenes[i].detail!.forEach((_, j) => {
        setTimeout(() => {
          Haptics.selectionAsync();
          Animated.spring(detailAnims[j], { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
        }, 1000 + j * 300);
      });
    }
    if (scenes[i].empathy) setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), 600);
  }, [scenes]);

  const advance = useCallback(() => {
    if (doneRef.current) return;
    const next = currentRef.current + 1;
    if (next >= scenes.length) {
      doneRef.current = true; Speech.stop(); onComplete(); return;
    }
    currentRef.current = next; setCurrentScene(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(progressAnim, { toValue: next / (scenes.length - 1), duration: 400, useNativeDriver: false }).start();
    Animated.timing(sceneFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      animateIn(next);
      speak(scenes[next].narration, () => {
        setTimeout(() => { if (!pausedRef.current && !doneRef.current) advance(); }, 800);
      }, mutedRef.current);
    });
  }, [scenes, animateIn, onComplete]);

  useEffect(() => {
    animateIn(0);
    Animated.loop(Animated.sequence([
      Animated.timing(iconPulse, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(iconPulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    setTimeout(() => {
      speak(scenes[0].narration, () => {
        setTimeout(() => { if (!pausedRef.current && !doneRef.current) advance(); }, 800);
      }, mutedRef.current);
    }, 500);

    return () => { Speech.stop(); };
  }, []);

  const toggleMute = () => {
    const m = !mutedRef.current;
    mutedRef.current = m; setMuted(m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (m) Speech.stop();
  };

  const togglePause = () => {
    const p = !pausedRef.current;
    pausedRef.current = p; setPaused(p);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (p) { Speech.stop(); } else {
      speak(scenes[currentRef.current].narration, () => {
        setTimeout(() => { if (!pausedRef.current && !doneRef.current) advance(); }, 800);
      }, mutedRef.current);
    }
  };

  const handleSkip = () => {
    doneRef.current = true; Speech.stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onSkip();
  };

  const scene = scenes[currentScene];
  const prog = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={pStyles.container}>
      {/* Overlay buttons — mute + skip */}
      <View style={pStyles.overlayBtns}>
        <TouchableOpacity onPress={toggleMute} style={pStyles.overlayBtn} activeOpacity={0.7}>
          <FontAwesome name={muted ? 'volume-off' : 'volume-up'} size={16} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} style={pStyles.overlayBtnSkip} activeOpacity={0.7}>
          <Text style={pStyles.overlaySkipText}>Skip</Text>
          <FontAwesome name="forward" size={12} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Video area */}
      <View style={[pStyles.videoArea, { backgroundColor: scene.bg }]}>
        <Animated.View style={[pStyles.sceneContent, { opacity: sceneFade }]}>
          <Animated.View style={[pStyles.iconWrap, { transform: [{ scale: Animated.multiply(iconScale, iconPulse) }] }]}>
            <View style={[pStyles.iconCircle, { backgroundColor: scene.iconBg }]}>
              <FontAwesome name={scene.icon as any} size={30} color={scene.iconColor} />
            </View>
          </Animated.View>
          <Animated.Text style={[pStyles.title, { transform: [{ translateY: titleSlide }] }]}>{scene.title}</Animated.Text>
          <View style={pStyles.linesWrap}>
            {scene.lines.map((line, i) => (
              <Animated.Text key={i} style={[pStyles.line, { opacity: lineAnims[i] }, line === '' && { height: 8 }, scene.empathy && line !== '' && pStyles.lineEmpathy]}>
                {line}
              </Animated.Text>
            ))}
          </View>
          {scene.detail && (
            <View style={pStyles.detailRow}>
              {scene.detail.map((d, i) => (
                <Animated.View key={i} style={[pStyles.detailCard, { opacity: detailAnims[i], transform: [{ scale: detailAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
                  <Text style={pStyles.detailValue}>{d.value}</Text>
                  <Text style={pStyles.detailLabel}>{d.label}</Text>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={pStyles.controls}>
        <View style={pStyles.barTrack}>
          <Animated.View style={[pStyles.barFill, { width: prog }]} />
        </View>
        <View style={pStyles.controlRow}>
          <TouchableOpacity onPress={togglePause} style={pStyles.playBtn}>
            <FontAwesome name={paused ? 'play' : 'pause'} size={12} color={Colors.white} />
          </TouchableOpacity>
          <Text style={pStyles.sceneLabel}>{currentScene + 1} / {scenes.length}</Text>
          <View style={pStyles.sceneDots}>
            {scenes.map((_, i) => (
              <View key={i} style={[pStyles.sceneDot, i === currentScene && pStyles.sceneDotActive, i < currentScene && pStyles.sceneDotDone]} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Results ──
function ResultsCard({ q1, q2, q3 }: { q1: string; q2: string; q3: string }) {
  const fadeAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(20))).current;

  useEffect(() => {
    [0, 1, 2, 3, 4].forEach(i => {
      setTimeout(() => {
        Haptics.selectionAsync();
        Animated.parallel([
          Animated.timing(fadeAnims[i], { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(slideAnims[i], { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        ]).start();
      }, i * 250);
    });
  }, []);

  const insights = [
    { icon: 'folder-open', label: '3 active loans', detail: '₹2,85,600 total outstanding', color: '#EEF2FF' },
    { icon: 'calendar-times-o', label: 'Highest delay: 6 months', detail: 'Personal Loan · Bajaj Finserv', color: '#FFF7ED' },
    { icon: 'line-chart', label: 'Credit Score: 624', detail: 'Can improve with the right steps', color: '#F0FDF4' },
  ];

  return (
    <View style={rStyles.container}>
      <Animated.View style={[rStyles.header, { opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }]}>
        <View style={rStyles.checkCircle}>
          <FontAwesome name="check" size={16} color={Colors.white} />
        </View>
        <Text style={rStyles.headerTitle}>Your plan is ready</Text>
        <Text style={rStyles.headerSub}>Based on your credit report and your inputs</Text>
      </Animated.View>

      {insights.map((item, i) => (
        <Animated.View key={i} style={[rStyles.insightCard, { opacity: fadeAnims[i + 1], transform: [{ translateY: slideAnims[i + 1] }] }]}>
          <View style={[rStyles.insightIcon, { backgroundColor: item.color }]}>
            <FontAwesome name={item.icon as any} size={16} color={Colors.textPrimary} />
          </View>
          <View style={rStyles.insightText}>
            <Text style={rStyles.insightLabel}>{item.label}</Text>
            <Text style={rStyles.insightDetail}>{item.detail}</Text>
          </View>
        </Animated.View>
      ))}

      <Animated.View style={[rStyles.messageCard, { opacity: fadeAnims[4], transform: [{ translateY: slideAnims[4] }] }]}>
        <FontAwesome name="quote-left" size={14} color={Colors.primary} style={{ marginBottom: 8 }} />
        <Text style={rStyles.messageText}>
          {q2 ? `Many people face delays due to ${q2.toLowerCase()}. ` : ''}
          We've helped thousands of people in similar situations find a way forward. Your situation is not unique — and it can be resolved.
          {q3 ? ` Based on your income of ${q3.toLowerCase()}, we've prepared a plan that fits your budget.` : ''}
          {'\n\n'}You've already taken the hardest step — reaching out. We'll handle the rest.
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Main Screen ──
export default function AnalysisScreen() {
  const router = useRouter();
  const { q1Answer, q2Answer, q3Answer, firstName } = useOnboardingStore();
  const [videoComplete, setVideoComplete] = useState(false);
  const resultsFade = useRef(new Animated.Value(0)).current;
  const resultsSlide = useRef(new Animated.Value(40)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;

  const name = firstName || 'there';
  const scenes = buildScenes(name, q1Answer, q2Answer, q3Answer);

  const showResults = useCallback(() => {
    setVideoComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(resultsFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(resultsSlide, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }),
    ]).start();
    setTimeout(() => Animated.timing(ctaFade, { toValue: 1, duration: 400, useNativeDriver: true }).start(), 1200);
  }, []);

  const getCta = () => {
    if (q1Answer.includes('calls') || q1Answer.includes('harassment'))
      return { text: 'Activate call protection', type: 'neytra' };
    if (q1Answer.includes('legal') || q1Answer.includes('Legal'))
      return { text: 'Get legal help now', type: 'legal' };
    return { text: 'Start your settlement', type: 'resolution' };
  };
  const cta = getCta();

  return (
    <SafeAreaView style={styles.container}>
      {!videoComplete ? (
        <View style={styles.videoScreen}>
          <Image source={require('@/assets/credfix-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.videoLabel}>Your personalised report</Text>
          <VideoPlayer scenes={scenes} onComplete={showResults} onSkip={showResults} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Image source={require('@/assets/credfix-logo.png')} style={styles.logoSmall} resizeMode="contain" />
            <Animated.View style={{ opacity: resultsFade, transform: [{ translateY: resultsSlide }] }}>
              <ResultsCard q1={q1Answer} q2={q2Answer} q3={q3Answer} />
            </Animated.View>
          </ScrollView>
          <Animated.View style={[styles.ctaWrap, { opacity: ctaFade }]}>
            <TouchableOpacity style={styles.cta} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              if (cta.type === 'neytra') {
                router.replace('/neytra-screens/activate');
              } else if (cta.type === 'legal') {
                router.replace({ pathname: '/chat/new', params: { preselect: 'legal' } } as any)
              } else {
                router.replace({ pathname: '/chat/new', params: { preselect: 'settlement' } } as any)
              }
            }} activeOpacity={0.8}>
              <Text style={styles.ctaText}>{cta.text}</Text>
              <FontAwesome name="arrow-right" size={14} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.skipBtn} activeOpacity={0.6}>
              <Text style={styles.skipText}>I'll explore on my own</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const pStyles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  overlayBtns: { position: 'absolute', top: 16, right: 16, zIndex: 20, flexDirection: 'row', gap: 8 },
  overlayBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  overlayBtnSkip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlaySkipText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  videoArea: { flex: 1, borderRadius: 20, padding: 24, justifyContent: 'center' },
  sceneContent: { alignItems: 'center' },
  iconWrap: { marginBottom: 20 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  linesWrap: { alignItems: 'center', marginBottom: 16 },
  line: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 23 },
  lineEmpathy: { color: '#92400E', fontWeight: '500' },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8 },
  detailCard: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 90 },
  detailValue: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  detailLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  controls: { backgroundColor: '#1A1A2E', paddingHorizontal: 14, paddingBottom: 10, paddingTop: 8 },
  barTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  controlRow: { flexDirection: 'row', alignItems: 'center' },
  playBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  sceneLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginRight: 8, fontVariant: ['tabular-nums'] },
  sceneDots: { flexDirection: 'row', gap: 4, flex: 1 },
  sceneDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  sceneDotActive: { backgroundColor: Colors.primary, width: 14, borderRadius: 3 },
  sceneDotDone: { backgroundColor: 'rgba(255,255,255,0.4)' },
});

const rStyles = StyleSheet.create({
  container: { paddingHorizontal: 4 },
  header: { alignItems: 'center', marginBottom: 20 },
  checkCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  headerSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  insightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  insightIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  insightText: { flex: 1 },
  insightLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  insightDetail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  messageCard: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 18, marginTop: 8, borderWidth: 1, borderColor: Colors.primaryLight },
  messageText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  videoScreen: { flex: 1, alignItems: 'center', paddingTop: 12 },
  logo: { width: 140, height: 44, marginBottom: 6 },
  logoSmall: { width: 140, height: 44, alignSelf: 'center', marginBottom: 16 },
  videoLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', marginBottom: 10 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 160 },
  ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 14, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center' },
  cta: { flexDirection: 'row', width: '100%', paddingVertical: 17, borderRadius: 28, backgroundColor: Colors.ctaGreen, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 12 },
  skipText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
