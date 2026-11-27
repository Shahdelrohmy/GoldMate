import type { ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '../theme'

type CardProps = {
  children: ReactNode
  /** Turn the shadow off (used for cards inside lists or forms). */
  flat?: boolean
  style?: StyleProp<ViewStyle>
}

export function Card({ children, flat = false, style }: CardProps) {
  const { colors, radius, layout, shadows } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: layout.stroke,
          borderRadius: radius.card,
        },
        flat ? null : shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  )
}
