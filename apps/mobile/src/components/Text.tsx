import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { fontSize, fontWeight, lineHeight, useTheme } from '../theme'

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption'
type Tone = 'default' | 'muted' | 'gold' | 'profit' | 'loss' | 'warning' | 'onGold'

export type TextProps = RNTextProps & {
  variant?: Variant
  tone?: Tone
  /** Override the weight of the variant (regular, medium, semibold, bold). */
  weight?: keyof typeof fontWeight
}

const variants = {
  display: { fontSize: fontSize.display, fontWeight: fontWeight.bold, lineHeight: lineHeight(fontSize.display, 'tight') },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, lineHeight: lineHeight(fontSize.xl, 'tight') },
  heading: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: lineHeight(fontSize.lg, 'tight') },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: lineHeight(fontSize.md) },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, lineHeight: lineHeight(fontSize.sm) },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: lineHeight(fontSize.xs) },
} as const

// Use this instead of the raw RN Text so every screen gets the same type scale and colors.
export function Text({ variant = 'body', tone = 'default', weight, style, ...props }: TextProps) {
  const { colors } = useTheme()
  const color = {
    default: colors.text,
    muted: colors.muted,
    gold: colors.goldSoft,
    profit: colors.successText,
    loss: colors.dangerText,
    warning: colors.warningText,
    onGold: colors.onGold,
  }[tone]
  return <RNText {...props} style={[variants[variant], { color }, weight ? { fontWeight: fontWeight[weight] } : null, style]} />
}
