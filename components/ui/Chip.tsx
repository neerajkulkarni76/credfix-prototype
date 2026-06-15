import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white,
    alignSelf: 'center', minWidth: 220, alignItems: 'center',
  },
  selected: { backgroundColor: Colors.chipSelected, borderColor: Colors.chipSelected },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  selectedLabel: { color: Colors.white },
})
