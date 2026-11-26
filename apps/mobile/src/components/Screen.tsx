import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StatusBar, View, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../theme'

type ScreenProps = {
  children: ReactNode
  /** Set false for screens that manage their own scrolling (FlatList...). */
  scroll?: boolean
  contentStyle?: StyleProp<ViewStyle>
  /** Pass a function to enable pull-to-refresh. */
  onRefresh?: () => void
  refreshing?: boolean
  /** Floating button shown over the content at the bottom end (e.g. the Add button). */
  floatingAction?: ReactNode
}

// Every screen starts with this: background, safe area, keyboard handling and page padding.
export function Screen({ children, scroll = true, contentStyle, onRefresh, refreshing = false, floatingAction }: ScreenProps) {
  const { colors, spacing, mode } = useTheme()
  const padding: ViewStyle = { paddingHorizontal: spacing[4], paddingTop: spacing[6], paddingBottom: spacing[6] }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} />
              ) : undefined
            }
            contentContainerStyle={[padding, contentStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {floatingAction ? (
        <View style={{ position: 'absolute', end: spacing[6], bottom: spacing[6] }}>{floatingAction}</View>
      ) : null}
    </SafeAreaView>
  )
}
