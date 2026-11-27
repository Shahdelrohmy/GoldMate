import { useState } from 'react'
import { View } from 'react-native'
import { Button, Card, ConfirmDialog, OptionChips, Screen, Text, ToggleRow } from '../components'
import { useLanguage } from '../i18n'
import { useTheme, useThemeContext, type ThemePreference } from '../theme'
import type { Preferences } from '../types'

type SettingsScreenProps = {
  preferences: Preferences
  onChange: (next: Preferences) => void
  /** Real export/delete are connected by B (F-05 endpoints). */
  onExport: () => void | Promise<void>
  onDelete: () => void
}

export function SettingsScreen({ preferences, onChange, onExport, onDelete }: SettingsScreenProps) {
  const { t, language, setLanguage } = useLanguage()
  const { preference, setPreference } = useThemeContext()
  const { spacing } = useTheme()
  const [exported, setExported] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const field = (label: string, control: React.ReactNode) => (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label">{label}</Text>
      {control}
    </View>
  )

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('settingsTitle')}
      </Text>
      <Text variant="label" tone="muted" style={{ marginTop: spacing[2], marginBottom: spacing[4] }}>
        {t('settingsDemoNote')}
      </Text>

      <View style={{ gap: spacing[4] }}>
        <Card flat style={{ padding: spacing[4], gap: spacing[4] }}>
          {field(
            t('languageLabel'),
            <OptionChips
              value={language}
              onChange={setLanguage}
              options={[{ id: 'ar', label: t('langNameAr') }, { id: 'en', label: t('langNameEn') }]}
            />,
          )}
          {field(
            t('themeLabel'),
            <OptionChips<ThemePreference>
              value={preference}
              onChange={setPreference}
              options={[{ id: 'dark', label: t('themeDark') }, { id: 'light', label: t('themeLight') }, { id: 'system', label: t('themeSystem') }]}
            />,
          )}
          {field(
            t('jewelryZakat'),
            <OptionChips
              value={preferences.jewelryOpinion}
              onChange={(jewelryOpinion) => onChange({ ...preferences, jewelryOpinion })}
              options={[{ id: 'include', label: t('jewelryInclude') }, { id: 'exclude', label: t('jewelryExclude') }]}
            />,
          )}
          <Text variant="caption" tone="muted">
            {t('jewelryNote')}
          </Text>
        </Card>

        <Card flat style={{ padding: spacing[4], gap: spacing[2] }}>
          <Text variant="heading">{t('notifications')}</Text>
          <ToggleRow label={t('alertPrices')} value={preferences.priceAlerts} onChange={(priceAlerts) => onChange({ ...preferences, priceAlerts })} />
          <ToggleRow label={t('alertZakat')} value={preferences.zakatReminders} onChange={(zakatReminders) => onChange({ ...preferences, zakatReminders })} />
          <ToggleRow label={t('consentAnalytics')} value={preferences.analyticsConsent} onChange={(analyticsConsent) => onChange({ ...preferences, analyticsConsent })} />
          <Text variant="heading" style={{ marginTop: spacing[2] }}>
            {t('privacyTitle')}
          </Text>
          <Text variant="caption" tone="muted">
            {t('privacyNote')}
          </Text>
        </Card>

        <Button
          title={t('exportData')}
          variant="outline"
          fullWidth
          onPress={async () => {
            await onExport()
            setExported(true)
          }}
        />
        {exported ? (
          <Text variant="caption" tone="muted" accessibilityRole="alert">
            {t('exportedNote')}
          </Text>
        ) : null}
        <Button title={t('deleteAccount')} variant="danger" fullWidth onPress={() => setConfirming(true)} />
      </View>

      <ConfirmDialog
        visible={confirming}
        title={t('deleteTitle')}
        message={t('deleteBody')}
        cancelLabel={t('cancel')}
        confirmLabel={t('deleteConfirm')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          onDelete()
        }}
      />
    </Screen>
  )
}
