import { useState } from 'react'
import { View } from 'react-native'
import { Badge, Card, Icon, OptionChips, PriceChart, Screen, ScreenHeader, StatePanel, Text, UtilityActions } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'
import type { PricesData, ViewStatus } from '../types'
import { formatNumber, formatPercent } from '../utils/format'

type RangeId = '1W' | '1M' | '3M' | '1Y'

type PricesScreenProps = {
  status: ViewStatus
  data?: PricesData
  onRetry?: () => void
  onRefresh?: () => void
  refreshing?: boolean
  onRangeChange?: (range: RangeId) => void
}

export function PricesScreen({ status, data, onRetry, onRefresh, refreshing, onRangeChange }: PricesScreenProps) {
  const { t, language } = useLanguage()
  const { colors, spacing, layout } = useTheme()
  const [range, setRange] = useState<RangeId>('1M')
  const ready = status === 'ready' && data

  const ranges = [
    { id: '1W' as const, label: t('range1w') },
    { id: '1M' as const, label: t('range1m') },
    { id: '3M' as const, label: t('range3m') },
    { id: '1Y' as const, label: t('range1y') },
  ]

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      {ready ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
          <Icon name="refresh" size={15} color={colors.muted} />
          <Text variant="caption" tone="muted">
            {t('pull')}
          </Text>
        </View>
      ) : null}
      <ScreenHeader title={t('goldPrices')} subtitle={ready ? t('updatedAt', { time: data.updatedAt }) : undefined} actions={<UtilityActions />} />

      {!ready ? (
        <StatePanel
          kind={status === 'ready' ? 'empty' : status}
          icon="prices"
          title={status === 'loading' ? t('loading') : status === 'error' ? t('errorTitle') : t('noPricesTitle')}
          body={status === 'error' ? t('errorBody') : status === 'empty' || status === 'ready' ? t('noEstimatesBody') : undefined}
          actionLabel={status === 'error' ? t('retry') : undefined}
          onAction={onRetry}
        />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {data.karats.map((item) => (
              <Card key={item.karat} flat style={{ flex: 1, minWidth: 0, padding: spacing[3] }}>
                <View style={{ minHeight: spacing[6], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[1] }}>
                  <Text variant="caption" tone="muted">
                    {t('karat')} {formatNumber(item.karat, language)}
                  </Text>
                  <Badge label={formatPercent(item.changePct, language)} tone={item.changePct < 0 ? 'loss' : 'profit'} />
                </View>
                <Text variant="heading" style={{ marginTop: spacing[3] }}>
                  {formatNumber(item.pricePerGram, language)}
                </Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {t('perGram')}
                </Text>
              </Card>
            ))}
          </View>

          <Card flat style={{ marginTop: spacing[3], padding: spacing[4], flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: spacing[1] }}>
              <Text variant="caption" tone="muted">
                {t('ounce')}
              </Text>
              <Text variant="body" weight="semibold">
                ${formatNumber(data.ounceUsd, 'en', 2)}
              </Text>
            </View>
            <View style={{ width: layout.stroke, height: spacing[8], backgroundColor: colors.border }} />
            <View style={{ flex: 1, gap: spacing[1], paddingStart: spacing[4] }}>
              <Text variant="caption" tone="muted">
                {t('exchange')}
              </Text>
              <Text variant="body" weight="semibold">
                {formatNumber(data.usdEgp, language, 2)}
              </Text>
            </View>
          </Card>

          <Card flat style={{ marginTop: spacing[3], padding: spacing[4] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] }}>
              <Text variant="heading">{t('priceHistory')}</Text>
              <OptionChips
                variant="compact"
                options={ranges}
                value={range}
                onChange={(next) => {
                  setRange(next)
                  onRangeChange?.(next)
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing[2], marginTop: spacing[4] }}>
              <Text variant="heading">{t('money', { value: formatNumber(data.karats.find((k) => k.karat === 21)?.pricePerGram ?? 0, language) })}</Text>
              <Text variant="caption" tone={data.historyChangePct < 0 ? 'loss' : 'profit'}>
                {formatPercent(data.historyChangePct, language)}
              </Text>
            </View>
            <View style={{ marginTop: spacing[2] }}>
              <PriceChart points={data.history} accessibilityLabel={t('chartLabel')} />
            </View>
          </Card>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], marginTop: spacing[4], paddingHorizontal: spacing[2] }}>
            <View style={{ marginTop: spacing[1] }}>
              <Icon name="info" size={17} color={colors.warning} />
            </View>
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {t('indicative')}
            </Text>
          </View>
        </>
      )}
    </Screen>
  )
}
