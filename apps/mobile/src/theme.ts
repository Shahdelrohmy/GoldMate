import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useColorScheme, type ViewStyle } from 'react-native'

// Values are taken from the Figma Make export (src/theme.css).
// Never write raw hex colors or spacing numbers inside screens: use this file.

export type ThemePreference = 'dark' | 'light' | 'system'
export type ThemeMode = 'dark' | 'light'

type ColorTokens = {
  bg: string
  card: string
  cardRaised: string
  border: string
  text: string
  muted: string
  gold: string
  goldSoft: string
  onGold: string
  profit: string
  loss: string
  warning: string
  focus: string
  overlay: string
  dangerText: string
  successText: string
  warningText: string
}

export const darkColors: ColorTokens = {
  bg: '#0d0d0f',
  card: '#17171a',
  cardRaised: '#1d1d21',
  border: '#2a2a2f',
  text: '#f5f2e8',
  muted: '#a09a88',
  gold: '#d4af37',
  goldSoft: '#f0d78c',
  onGold: '#17130a',
  profit: '#3fa66b',
  loss: '#d6564b',
  warning: '#e0a030',
  focus: '#f0d78c',
  overlay: 'rgba(13, 13, 15, 0.72)',
  dangerText: '#f1877e',
  successText: '#68c48e',
  warningText: '#f0bd65',
}

export const lightColors: ColorTokens = {
  ...darkColors,
  bg: '#faf7f0',
  card: '#ffffff',
  cardRaised: '#fdfaf4',
  border: '#e8e0cc',
  text: '#1a1a1a',
  muted: '#6b6454',
  goldSoft: '#8a6a12',
  onGold: '#1a1a1a',
  focus: '#8a6a12',
  overlay: 'rgba(250, 247, 240, 0.74)',
  dangerText: '#a52c24',
  successText: '#237342',
  warningText: '#825500',
}

export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 10: 40, 12: 48 } as const

export const radius = { sm: 8, md: 12, card: 16, lg: 24, pill: 999 } as const

export const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, display: 32 } as const

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

// RN needs line height in px, so we keep the ratios from the design and compute it.
export const lineHeightRatio = { tight: 1.2, normal: 1.6 } as const
export function lineHeight(size: number, kind: keyof typeof lineHeightRatio = 'normal') {
  return Math.round(size * lineHeightRatio[kind])
}

export const layout = {
  touchTarget: 48,
  inputHeight: 56,
  buttonHeight: 56,
  stroke: 1,
  strokeStrong: 1.5,
} as const

function makeShadows(mode: ThemeMode, colors: ColorTokens): Record<'card' | 'gold', ViewStyle> {
  const isDark = mode === 'dark'
  return {
    card: {
      shadowColor: isDark ? '#000000' : '#4d3a0d',
      shadowOpacity: isDark ? 0.24 : 0.1,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 20 },
      elevation: 6,
    },
    gold: {
      shadowColor: isDark ? colors.gold : '#8a6a12',
      shadowOpacity: isDark ? 0.14 : 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 12 },
      elevation: 3,
    },
  }
}

export type Theme = {
  mode: ThemeMode
  colors: ColorTokens
  spacing: typeof spacing
  radius: typeof radius
  fontSize: typeof fontSize
  fontWeight: typeof fontWeight
  layout: typeof layout
  shadows: ReturnType<typeof makeShadows>
}

function buildTheme(mode: ThemeMode): Theme {
  const colors = mode === 'dark' ? darkColors : lightColors
  return { mode, colors, spacing, radius, fontSize, fontWeight, layout, shadows: makeShadows(mode, colors) }
}

type ThemeContextValue = {
  theme: Theme
  preference: ThemePreference
  setPreference: (value: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// The design starts in dark mode, so that is the default here.
// Saving the choice between app launches is not done yet.
export function ThemeProvider({
  children,
  initialPreference = 'dark',
}: {
  children: ReactNode
  initialPreference?: ThemePreference
}) {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference)
  const systemScheme = useColorScheme()
  const mode: ThemeMode =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference
  const value = useMemo(
    () => ({ theme: buildTheme(mode), preference, setPreference }),
    [mode, preference],
  )
  return createElement(ThemeContext.Provider, { value }, children)
}

export function useThemeContext(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}

export function useTheme(): Theme {
  return useThemeContext().theme
}
