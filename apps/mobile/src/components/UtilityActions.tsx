import { Pressable, View } from 'react-native'
import { useLanguage } from '../i18n'
import { useThemeContext } from '../theme'
import { IconButton } from './IconButton'
import { Text } from './Text'

// Language + theme quick buttons shown at the end of screen headers.
export function UtilityActions() {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setPreference } = useThemeContext()
  const { spacing, layout, radius, colors } = theme
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('language')}
        onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        style={{
          minHeight: layout.touchTarget,
          paddingHorizontal: spacing[3],
          justifyContent: 'center',
          borderRadius: radius.pill,
          borderWidth: layout.stroke,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text variant="label" tone="muted">
          {t('language')}
        </Text>
      </Pressable>
      <IconButton
        icon={theme.mode === 'dark' ? 'sun' : 'moon'}
        accessibilityLabel={t('changeTheme')}
        onPress={() => setPreference(theme.mode === 'dark' ? 'light' : 'dark')}
      />
    </View>
  )
}
