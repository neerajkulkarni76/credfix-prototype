import { Link } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go home</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  link: { marginTop: 15 },
  linkText: { fontSize: 16, color: Colors.primary },
})
