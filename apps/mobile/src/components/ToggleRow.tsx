import { Switch, View } from 'react-native'
import { useTheme } from '../theme'
import { Text } from './Text'

type ToggleRowProps = {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  const { colors, spacing, layout } = useTheme()
  return (
    <View style={{ minHeight: layout.touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] }}>
      <Text variant="label" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.gold }}
        thumbColor={colors.card}
      />
    </View>
  )
}
