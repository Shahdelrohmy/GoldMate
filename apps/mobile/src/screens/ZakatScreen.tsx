import { useState } from 'react'
import { View } from 'react-native'
import { Badge, Button, Card, Icon, ProgressBar, Screen, ScreenHeader, Text, UtilityActions } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'
import type { ZakatStatus } from '../types'
import { formatNumber } from '../utils/format'

type ZakatScreenProps = {
  status: ZakatStatus
  /** Called when the user taps "I paid zakat". Saving is connected by B. */
  onPaid?: () => void
}

export function ZakatScreen({ status, onPaid }: ZakatScreenProps) {
  const { t, language } = useLanguage()
  const { colors, spacing, radius } = useTheme()
  const [paid, setPaid] = useState(false)
  const above = status.aboveNisab
  const dash = '—'
  const grams = (value: number) => t('weightValue', { value: formatNumber(value, language, 1) })

  return (
    <Screen>
      <ScreenHeader title={t('zakatTitle')} actions={<UtilityActions />} />

      <Card flat style={{ padding: spacing[4], gap: spacing[2], borderColor: above ? colors.gold : colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ gap: spacing[1] }}>
            <Text variant="caption" tone="muted">
              {t('nisabProgress')}
            </Text>
            <Text variant="title">{grams(status.pureGoldG)}</Text>
          </View>
          <Badge label={above ? t('aboveNisab') : t('belowNisab')} tone={above ? 'profit' : 'gold'} />
        </View>
        <ProgressBar progress={status.pureGoldG / status.nisabG} color={above ? colors.profit : colors.gold} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="muted">
            {t('weightValue', { value: formatNumber(0, language) })}
          </Text>
          <Text variant="caption" tone="muted" weight="bold">
            {t('nisab')}: {t('weightValue', { value: formatNumber(status.nisabG, language) })}
          </Text>
        </View>
      </Card>

      <Card flat style={{ marginTop: spacing[3], padding: spacing[4], gap: spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
          <View style={{ width: spacing[10], height: spacing[10], alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.cardRaised }}>
            <Icon name="moon" color={colors.goldSoft} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="heading">{t('hijriYear')}</Text>
            <Text variant="caption" tone="muted" style={{ marginTop: spacing[1] }}>
              {above && status.periodLabel ? status.periodLabel : t('noZakatYet')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Text variant="caption" tone="muted">
              {t('startDate')}
            </Text>
            <Text variant="label">{above && status.startLabel ? status.startLabel : dash}</Text>
          </View>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Text variant="caption" tone="muted">
              {t('daysRemaining')}
            </Text>
            <Text variant="label">
              {above && status.daysRemaining !== undefined ? t('daysCount', { count: formatNumber(status.daysRemaining, language) }) : dash}
            </Text>
          </View>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Text variant="caption" tone="muted">
              {t('zakatDue')}
            </Text>
            <Text variant="label" tone={above ? 'gold' : 'default'}>
              {above && status.dueAmount !== undefined ? t('money', { value: formatNumber(status.dueAmount, language) }) : dash}
            </Text>
            {above && status.ratePct !== undefined ? (
              <Text variant="caption" tone="muted">
                {formatNumber(status.ratePct, 'en', 1)}%
              </Text>
            ) : null}
          </View>
        </View>

        <Button
          title={paid ? t('paidDone') : t('paidZakat')}
          fullWidth
          disabled={!above || paid}
          icon={paid ? <Icon name="check" color={colors.onGold} /> : undefined}
          onPress={() => {
            setPaid(true)
            onPaid?.()
          }}
        />
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginTop: spacing[4], paddingHorizontal: spacing[2] }}>
        <Icon name="info" color={colors.muted} />
        <Text variant="label" tone="muted" weight="regular" style={{ flex: 1 }}>
          {t('zakatNotice')}
        </Text>
      </View>
    </Screen>
  )
}
