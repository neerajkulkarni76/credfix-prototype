import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Colors from '@/constants/Colors'

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Credit Report coming soon</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  text: { fontSize: 16, color: Colors.textSecondary },
})
