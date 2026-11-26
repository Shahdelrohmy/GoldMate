import { Pressable, View } from 'react-native'
import { useTheme } from '../theme'
import { Icon, type IconName } from './Icon'
import { Text } from './Text'

export type Option<T extends string> = { id: T; label: string; icon?: IconName }

type OptionChipsProps<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  /** segmented = equal-width big buttons, chips = small pills, compact = tiny buttons (chart range). */
  variant?: 'segmented' | 'chips' | 'compact'
}

// One reusable "pick one option" control: gold type, karat, chart range, theme, language...
export function OptionChips<T extends string>({ options, value, onChange, variant = 'chips' }: OptionChipsProps<T>) {
  const { colors, spacing, radius, layout } = useTheme()
  const compact = variant === 'compact'
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: compact ? spacing[1] : spacing[2] }}>
      {options.map((option) => {
        const active = option.id === value
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.id)}
            style={{
              ...(compact ? {} : { flex: 1 }),
              minWidth: compact ? spacing[8] : undefined,
              minHeight: compact ? spacing[8] : layout.touchTarget,
              paddingHorizontal: spacing[2],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              borderRadius: compact ? radius.sm : radius.md,
              borderWidth: compact ? 0 : layout.stroke,
              borderColor: active ? colors.gold : colors.border,
              backgroundColor: active ? colors.gold : compact ? 'transparent' : colors.card,
            }}
          >
            {option.icon ? <Icon name={option.icon} size={18} color={active ? colors.onGold : colors.muted} /> : null}
            <Text variant={compact ? 'caption' : 'label'} style={{ color: active ? colors.onGold : colors.muted }}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
