import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Button, Card, Input, OptionChips, ProgressBar, Screen, ScreenHeader, Text, UtilityActions } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'
import type { Karat, PriceCheckInput, PriceCheckResult } from '../types'
import { formatNumber } from '../utils/format'

type PriceCheckScreenProps = {
  onBack: () => void
  /** The check is done by the backend (or the mock layer), never inside this screen. */
  onCheck: (input: PriceCheckInput) => Promise<PriceCheckResult>
}

const toNumber = (text: string) => Number(text.replace(',', '.'))

export function PriceCheckScreen({ onBack, onCheck }: PriceCheckScreenProps) {
  const { t, language } = useLanguage()
  const { colors, spacing } = useTheme()
  const [type, setType] = useState<'coin' | 'bar'>('coin')
  const [karat, setKarat] = useState<'24' | '21' | '18'>('21')
  const [weight, setWeight] = useState('8')
  const [total, setTotal] = useState('38440')
  const [making, setMaking] = useState('1120')
  const [result, setResult] = useState<PriceCheckResult | null>(null)

  const valid = toNumber(weight) > 0 && toNumber(total) > 0 && making.trim() !== '' && toNumber(making) >= 0

  useEffect(() => {
    if (!valid) {
      setResult(null)
      return
    }
    let cancelled = false
    onCheck({
      type,
      karat: Number(karat) as Karat,
      weightG: toNumber(weight),
      totalPrice: toNumber(total),
      makingCharge: toNumber(making),
    })
      .then((value) => !cancelled && setResult(value))
      .catch(() => !cancelled && setResult(null))
    return () => {
      cancelled = true
    }
  }, [type, karat, weight, total, making, valid, onCheck])

  const message = result ? { ok: t('checkOk'), high: t('checkHigh'), low: t('checkLow') }[result.status] : t('enterValid')
  const messageTone = !result ? 'default' : result.status === 'ok' ? 'profit' : result.status === 'high' ? 'warning' : 'loss'

  return (
    <Screen>
      <ScreenHeader title={t('priceCheckTitle')} subtitle={t('priceCheckSubtitle')} onBack={onBack} backLabel={t('backToCalculators')} actions={<UtilityActions />} />
      <View style={{ gap: spacing[4] }}>
        <OptionChips value={type} onChange={setType} variant="segmented" options={[{ id: 'coin', label: t('coin') }, { id: 'bar', label: t('bar') }]} />
        <View>
          <Text variant="label" style={{ marginBottom: spacing[2] }}>
            {t('karat')}
          </Text>
          <OptionChips value={karat} onChange={setKarat} options={(['24', '21', '18'] as const).map((k) => ({ id: k, label: t('karatLabel', { karat: k }) }))} />
        </View>
        <View>
          <Input label={t('weight')} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix={t('gram')} />
          <Input label={t('totalPriceEgp')} value={total} onChangeText={setTotal} keyboardType="decimal-pad" />
          <Input label={t('totalMakingEgp')} value={making} onChangeText={setMaking} keyboardType="decimal-pad" />
        </View>
      </View>

      <Card flat style={{ padding: spacing[4], gap: spacing[3] }}>
        <Text variant="heading" tone={messageTone} accessibilityRole="alert">
          {message}
        </Text>
        {result ? (
          <>
            <Text variant="caption" tone="muted">
              {t('makingShare')}
            </Text>
            <Text variant="title">{formatNumber(result.makingPct, language, 1)}%</Text>
            <Text variant="caption" tone="muted">
              {t('usualRange', { range: `0–${formatNumber(result.rangeMaxPct, language)}%` })}
            </Text>
            <View style={{ direction: 'ltr' }}>
              <ProgressBar progress={result.rangeMaxPct / 10} marker={result.makingPct / 10} color={colors.profit} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="caption" tone="muted">
                  0%
                </Text>
                <Text variant="caption" tone="muted">
                  10%+
                </Text>
              </View>
            </View>
            <Text variant="caption" tone="muted">
              {t('checkNote')}
            </Text>
          </>
        ) : null}
      </Card>
      <Text variant="caption" tone="muted" style={{ marginTop: spacing[4] }}>
        {t('notJudgment')}
      </Text>
    </Screen>
  )
}
