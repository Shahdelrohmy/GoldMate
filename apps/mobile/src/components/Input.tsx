import { useState, type ComponentRef, type ReactNode, type Ref } from 'react'
import { I18nManager, TextInput, View, type TextInputProps } from 'react-native'
import { useTheme } from '../theme'
import { Text } from './Text'

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string
  /** Shown at the start of the field (mail icon, lock icon...). */
  icon?: ReactNode
  /** Shown at the end of the field (show/hide password button...). */
  endAdornment?: ReactNode
  /** Small unit text at the end of the field (g, EGP...). Pass translated text. */
  suffix?: string
  /** Error text under the field. Also turns the border red. */
  error?: string
  /** For emails and numbers: keep typing direction left-to-right even in Arabic. */
  forceLTR?: boolean
  inputRef?: Ref<ComponentRef<typeof TextInput>>
}

export function Input({ label, icon, endAdornment, suffix, error, forceLTR = false, inputRef, onFocus, onBlur, ...props }: InputProps) {
  const { colors, spacing, radius, layout, fontSize } = useTheme()
  const [focused, setFocused] = useState(false)
  const borderColor = error ? colors.loss : focused ? colors.focus : colors.border

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <Text variant="label" style={{ marginBottom: spacing[2] }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: layout.inputHeight,
          borderWidth: focused ? layout.strokeStrong : layout.stroke,
          borderColor,
          borderRadius: radius.md,
          backgroundColor: colors.bg,
        }}
      >
        {icon ? (
          <View style={{ width: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        ) : (
          <View style={{ width: spacing[4] }} />
        )}
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          selectionColor={colors.gold}
          {...props}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          style={[
            { flex: 1, minWidth: 0, height: '100%', color: colors.text, fontSize: fontSize.md },
            forceLTR ? { writingDirection: 'ltr', textAlign: I18nManager.isRTL ? 'right' : 'left' } : null,
          ]}
        />
        {suffix ? (
          <Text variant="caption" tone="muted" style={{ marginEnd: spacing[4] }}>
            {suffix}
          </Text>
        ) : null}
        {endAdornment}
      </View>
      {error ? (
        <Text variant="caption" tone="loss" style={{ marginTop: spacing[1] }}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}
