import { View } from 'react-native'
import { useTheme } from '../theme'
import { Text } from './Text'

type BadgeProps = {
  label: string
  tone?: 'gold' | 'profit' | 'loss'
}

export function Badge({ label, tone = 'gold' }: BadgeProps) {
  const { colors, spacing, radius } = useTheme()
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
        borderRadius: radius.pill,
        backgroundColor: colors.cardRaised,
      }}
    >
      <Text variant="caption" tone={tone === 'gold' ? 'gold' : tone}>
        {label}
      </Text>
    </View>
  )
}
