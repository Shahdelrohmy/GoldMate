import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '../theme'
import { Text } from './Text'

type ButtonProps = {
  title: string
  onPress?: () => void
  variant?: 'primary' | 'outline' | 'danger'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  /** Optional icon shown before the title. */
  icon?: ReactNode
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const { colors, radius, spacing, layout, shadows, fontWeight } = useTheme()
  const inactive = disabled || loading
  const textColor = variant === 'primary' ? colors.onGold : variant === 'danger' ? colors.dangerText : colors.text

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: layout.buttonHeight,
          paddingHorizontal: spacing[6],
          borderRadius: radius.md,
          borderWidth: layout.stroke,
          borderColor:
            variant === 'primary' ? 'transparent' : variant === 'danger' ? colors.dangerText : colors.border,
          backgroundColor:
            variant === 'primary' ? colors.gold : variant === 'danger' ? colors.card : 'transparent',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: inactive ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && !inactive ? shadows.gold : null,
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        {loading ? <ActivityIndicator color={textColor} /> : icon}
        <Text variant="body" style={{ color: textColor, fontWeight: fontWeight.bold }}>
          {title}
        </Text>
      </View>
    </Pressable>
  )
}
