import { Stack } from 'expo-router'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, Caveat_700Bold } from '@expo-google-fonts/caveat'
import 'react-native-reanimated'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Caveat_700Bold })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding/loader" options={{ animation: 'fade' }} />
      <Stack.Screen name="onboarding/signup" />
      <Stack.Screen name="onboarding/otp" />
      <Stack.Screen name="onboarding/profile" />
      <Stack.Screen name="onboarding/splash1" />
      <Stack.Screen name="onboarding/splash2" />
      <Stack.Screen name="onboarding/splash3" />
      <Stack.Screen name="onboarding/intro" />
      <Stack.Screen name="onboarding/q1" />
      <Stack.Screen name="onboarding/q2" />
      <Stack.Screen name="onboarding/q3" />
      <Stack.Screen name="onboarding/analysis" />
      <Stack.Screen name="onboarding/landing" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/risi-hub" />
      <Stack.Screen name="chat/new" />
      <Stack.Screen name="chat/settlement" />
      <Stack.Screen name="chat/legal" />
      <Stack.Screen name="chat/score-improvement" />
      <Stack.Screen name="chat/thread" />
      <Stack.Screen name="neytra-screens/activate" options={{ gestureEnabled: false }} />
      <Stack.Screen name="neytra-screens/index" />
      <Stack.Screen name="neytra-screens/history" />
      <Stack.Screen name="neytra-screens/insights" />
      <Stack.Screen name="savings-screens/index" />
      <Stack.Screen name="gmail-screens/index" />
      <Stack.Screen name="gmail-screens/email-detail" />
    </Stack>
  )
}
