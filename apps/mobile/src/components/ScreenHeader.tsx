import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { useTheme } from '../theme'
import { Icon } from './Icon'
import { Text } from './Text'

type ScreenHeaderProps = {
  title: string
  subtitle?: string
  /** Pass a function to show the back button. */
  onBack?: () => void
  /** Accessibility label for the back button (translated text from the caller). */
  backLabel?: string
  /** Buttons at the end of the header (language, theme...). */
  actions?: ReactNode
}

export function ScreenHeader({ title, subtitle, onBack, backLabel, actions }: ScreenHeaderProps) {
  const { colors, spacing, layout } = useTheme()
  return (
    <View
      style={{
        minHeight: layout.touchTarget,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[2],
        marginBottom: spacing[6],
      }}
    >
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={onBack}
            style={{ width: layout.touchTarget, height: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="chevron" color={colors.text} mirror="rtl" />
          </Pressable>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="muted" style={{ marginTop: spacing[1] }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {actions}
    </View>
  )
}
