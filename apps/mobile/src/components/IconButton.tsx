import { Pressable } from 'react-native'
import { useTheme } from '../theme'
import { Icon, type IconName } from './Icon'

type IconButtonProps = {
  icon: IconName
  onPress?: () => void
  /** Required: icon-only buttons need a text for screen readers (translated by the caller). */
  accessibilityLabel: string
  /** Draw the round border + card background (header buttons). */
  bordered?: boolean
}

export function IconButton({ icon, onPress, accessibilityLabel, bordered = true }: IconButtonProps) {
  const { colors, radius, layout } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        width: layout.touchTarget,
        height: layout.touchTarget,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.pill,
        borderWidth: bordered ? layout.stroke : 0,
        borderColor: pressed ? colors.gold : colors.border,
        backgroundColor: bordered ? colors.card : 'transparent',
      })}
    >
      <Icon name={icon} color={colors.muted} />
    </Pressable>
  )
}
