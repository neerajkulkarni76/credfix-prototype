import React, { useEffect, useRef } from 'react'
import { View, Image, StyleSheet, Platform, Animated, Easing } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={21} style={{ marginBottom: -2 }} {...props} />
}

function RisiFab() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.15)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.15, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Slow orbit rotation for the ring
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.fabContainer}>
      {/* Outer glow */}
      <Animated.View style={[styles.fabGlow, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />

      {/* Orbiting ring */}
      <Animated.View style={[styles.fabOrbitRing, { transform: [{ rotate: spin }] }]}>
        <View style={styles.orbitDot} />
      </Animated.View>

      {/* Main button */}
      <Animated.View style={[styles.fab, { transform: [{ scale: pulseAnim }] }]}>
        <Image
          source={require('@/assets/risi-nav.png')}
          style={styles.risiIcon}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, 8)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#C0C0C8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="neytra"
        options={{
          title: 'Neytra',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/neytra-tab.png')}
              style={[styles.neytraTab, { tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: 'Risi',
          tabBarIcon: () => <RisiFab />,
          tabBarLabel: () => null,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault()
            router.push('/chat/risi-hub')
          },
        })}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Funds',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="piggy-bank-outline" size={22} color={color} style={{ marginBottom: -2 }} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />
    </Tabs>
  )
}

const FAB_SIZE = 62;
const GLOW_SIZE = FAB_SIZE + 14;
const ORBIT_SIZE = FAB_SIZE + 10;

const styles = StyleSheet.create({
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: GLOW_SIZE, height: GLOW_SIZE,
    marginBottom: 16,
  },
  fabGlow: {
    position: 'absolute',
    width: GLOW_SIZE, height: GLOW_SIZE, borderRadius: GLOW_SIZE / 2,
    backgroundColor: Colors.primary,
  },
  fabOrbitRing: {
    position: 'absolute',
    width: ORBIT_SIZE, height: ORBIT_SIZE, borderRadius: ORBIT_SIZE / 2,
    borderWidth: 1.5, borderColor: 'rgba(74, 58, 255, 0.2)',
    borderStyle: 'dashed',
  },
  orbitDot: {
    position: 'absolute', top: -3, left: '50%', marginLeft: -3,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  fab: {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14,
    elevation: 12,
  },
  risiIcon: {
    width: FAB_SIZE, height: FAB_SIZE,
  },
  neytraTab: {
    width: 20, height: 20, borderRadius: 4, marginBottom: -2,
  },
})
