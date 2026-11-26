import { useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Button, Card, Icon, Input, OptionChips, Screen, ScreenHeader, Text, UtilityActions } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'
import type { Karat, NewPieceInput, PieceType } from '../types'

type AddPieceScreenProps = {
  onBack: () => void
  /** Saves the piece (real API is connected by B). */
  onSubmit: (piece: NewPieceInput) => void | Promise<void>
  onSaved: () => void
  /** Opens the photo picker. Not connected yet: the box looks disabled until this is passed. */
  onPickInvoice?: () => void
}

const toNumber = (text: string) => Number(text.replace(',', '.'))

export function AddPieceScreen({ onBack, onSubmit, onSaved, onPickInvoice }: AddPieceScreenProps) {
  const { t } = useLanguage()
  const { colors, spacing, radius, layout } = useTheme()
  const [type, setType] = useState<PieceType>('coin')
  const [karat, setKarat] = useState<'24' | '21' | '18'>('21')
  const [weight, setWeight] = useState('')
  const [price, setPrice] = useState('')
  const [making, setMaking] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [shop, setShop] = useState('')
  const [errors, setErrors] = useState<{ weight?: string; price?: string }>({})
  const [saved, setSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function save() {
    const next: typeof errors = {}
    if (!(toNumber(weight) > 0)) next.weight = t('requiredError')
    if (!(toNumber(price) > 0)) next.price = t('errPriceRequired')
    setErrors(next)
    if (Object.keys(next).length > 0) return
    await onSubmit({
      type,
      karat: Number(karat) as Karat,
      weightG: toNumber(weight),
      price: toNumber(price),
      makingCharge: making ? toNumber(making) : undefined,
      date,
      shopName: shop.trim() || undefined,
    })
    setSaved(true)
    timer.current = setTimeout(onSaved, 650)
  }

  const label = (text: string) => (
    <Text variant="label" style={{ marginBottom: spacing[2] }}>
      {text}
    </Text>
  )

  return (
    <Screen>
      <ScreenHeader title={t('addPiece')} onBack={onBack} backLabel={t('back')} actions={<UtilityActions />} />
      <View style={{ gap: spacing[6] }}>
        <View>
          {label(t('type'))}
          <OptionChips
            variant="segmented"
            value={type}
            onChange={setType}
            options={[
              { id: 'coin', label: t('coin'), icon: 'coin' },
              { id: 'bar', label: t('bar'), icon: 'bar' },
              { id: 'jewelry', label: t('jewelry'), icon: 'jewelry' },
            ]}
          />
        </View>
        <View>
          {label(t('karat'))}
          <OptionChips
            value={karat}
            onChange={setKarat}
            options={(['24', '21', '18'] as const).map((k) => ({ id: k, label: t('karatLabel', { karat: k }) }))}
          />
        </View>
        <View>
          <Input label={t('weight')} placeholder={t('weightPlaceholder')} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix={t('gram')} error={errors.weight} />
          <Input label={t('purchasePrice')} placeholder={t('pricePlaceholder')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" suffix={t('egp')} error={errors.price} />
          <Input label={t('makingCharge')} placeholder={t('makingPlaceholder')} value={making} onChangeText={setMaking} keyboardType="decimal-pad" suffix={t('egp')} />
          <Input label={t('purchaseDate')} placeholder={t('dateHint')} value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" forceLTR maxLength={10} />
          <Input label={t('shopName')} placeholder={t('shopPlaceholder')} value={shop} onChangeText={setShop} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('uploadTitle')}
          accessibilityState={{ disabled: !onPickInvoice }}
          onPress={onPickInvoice}
          style={{ opacity: onPickInvoice ? 1 : 0.6 }}
        >
          <Card flat style={{ minHeight: spacing[12] * 2, alignItems: 'center', justifyContent: 'center', padding: spacing[4], gap: spacing[1], borderStyle: 'dashed', borderRadius: radius.card }}>
            <View style={{ width: layout.touchTarget, height: layout.touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.cardRaised }}>
              <Icon name="camera" color={colors.goldSoft} />
            </View>
            <Text variant="label">{t('uploadTitle')}</Text>
            <Text variant="caption" tone="muted">
              {t('uploadHint')}
            </Text>
          </Card>
        </Pressable>

        <Button
          title={saved ? t('saved') : t('save')}
          fullWidth
          disabled={saved}
          icon={saved ? <Icon name="check" color={colors.onGold} /> : undefined}
          onPress={save}
        />
      </View>
    </Screen>
  )
}
