import { useEffect, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { Button, Card, Icon, Input, OptionChips, Screen, ScreenHeader, Text, UtilityActions } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'
import type { Karat, MakingChargeInput, MakingChargeResult } from '../types'
import { formatNumber } from '../utils/format'

type MakingChargesScreenProps = {
  onBack: () => void
  /** The calculation is done by the backend (or the mock layer), never inside this screen. */
  onCalculate: (input: MakingChargeInput) => Promise<MakingChargeResult>
}

const toNumber = (text: string) => Number(text.replace(',', '.'))

export function MakingChargesScreen({ onBack, onCalculate }: MakingChargesScreenProps) {
  const { t, language } = useLanguage()
  const { colors, spacing } = useTheme()
  const [weight, setWeight] = useState('12')
  const [karat, setKarat] = useState<'24' | '21' | '18'>('18')
  const [total, setTotal] = useState('55980')
  const [result, setResult] = useState<MakingChargeResult | null>(null)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    const input: MakingChargeInput = { weightG: toNumber(weight), karat: Number(karat) as Karat, totalPrice: toNumber(total) }
    if (!(input.weightG > 0) || !(input.totalPrice > 0)) {
      setResult(null)
      return
    }
    let cancelled = false
    onCalculate(input)
      .then((value) => !cancelled && setResult(value))
      .catch(() => !cancelled && setResult(null))
    return () => {
      cancelled = true
    }
  }, [weight, karat, total, runId, onCalculate])

  const money = (value: number) => t('money', { value: formatNumber(value, language) })

  return (
    <Screen>
      <ScreenHeader title={t('makingCalc')} onBack={onBack} backLabel={t('back')} actions={<UtilityActions />} />
      <Input label={t('weight')} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix={t('gram')} />
      <View style={{ marginBottom: spacing[4] }}>
        <Text variant="label" style={{ marginBottom: spacing[2] }}>
          {t('karat')}
        </Text>
        <OptionChips value={karat} onChange={setKarat} options={(['24', '21', '18'] as const).map((k) => ({ id: k, label: t('karatLabel', { karat: k }) }))} />
      </View>
      <Input label={t('totalPrice')} value={total} onChangeText={setTotal} keyboardType="decimal-pad" suffix={t('egp')} />
      <Button
        title={t('calculate')}
        fullWidth
        onPress={() => {
          Keyboard.dismiss()
          setRunId((n) => n + 1)
        }}
      />

      {result ? (
        <Card style={{ marginTop: spacing[6], padding: spacing[4], gap: spacing[3] }}>
          <Text variant="caption" tone="gold">
            {t('result')}
          </Text>
          <View style={{ gap: spacing[1] }}>
            <Text variant="caption" tone="muted">
              {t('makingPerGram')}
            </Text>
            <Text variant="display">{money(result.makingPerGram)}</Text>
          </View>
          <View style={{ gap: spacing[2] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="label" tone="muted">
                {t('goldValue')}
              </Text>
              <Text variant="label">{money(result.goldValue)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="label" tone="muted">
                {t('totalMaking')}
              </Text>
              <Text variant="label">{money(result.totalMaking)}</Text>
            </View>
          </View>
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], marginTop: spacing[4] }}>
        <Icon name="info" size={16} color={colors.muted} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          {t('makingExplanation')}
        </Text>
      </View>
    </Screen>
  )
}
