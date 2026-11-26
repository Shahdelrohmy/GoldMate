import { Pressable, View } from 'react-native'
import { Badge, Card, Icon, Screen, ScreenHeader, Text, UtilityActions, type IconName } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'

type CalculatorsScreenProps = {
  onOpenMaking: () => void
  onOpenPriceCheck: () => void
}

type Item = { id: string; icon: IconName; title: string; description: string; onPress?: () => void }

export function CalculatorsScreen({ onOpenMaking, onOpenPriceCheck }: CalculatorsScreenProps) {
  const { t } = useLanguage()
  const { colors, spacing, radius, layout } = useTheme()

  // Buy/Sell and Break-even have no screen in the Figma design yet, so they are shown as "Soon".
  const items: Item[] = [
    { id: 'check', icon: 'shield', title: t('priceCheckTitle'), description: t('priceCheckDesc'), onPress: onOpenPriceCheck },
    { id: 'buySell', icon: 'prices', title: t('buySell'), description: t('buySellDesc') },
    { id: 'breakEven', icon: 'prices', title: t('breakEvenCalc'), description: t('breakEvenDesc') },
    { id: 'making', icon: 'jewelry', title: t('makingCalc'), description: t('makingDesc'), onPress: onOpenMaking },
  ]

  return (
    <Screen>
      <ScreenHeader title={t('calculatorsTitle')} actions={<UtilityActions />} />
      <View style={{ gap: spacing[3] }}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${t('openCalculator')}`}
            accessibilityState={{ disabled: !item.onPress }}
            disabled={!item.onPress}
            onPress={item.onPress}
          >
            <Card flat style={{ padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3], opacity: item.onPress ? 1 : 0.7 }}>
              <View style={{ width: layout.touchTarget, height: layout.touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.cardRaised }}>
                <Icon name={item.icon} color={colors.goldSoft} />
              </View>
              <View style={{ flex: 1, gap: spacing[1], alignItems: 'flex-start' }}>
                <Text variant="heading">{item.title}</Text>
                <Text variant="caption" tone="muted">
                  {item.description}
                </Text>
              </View>
              {item.onPress ? <Icon name="chevron" color={colors.muted} mirror="ltr" /> : <Badge label={t('soon')} />}
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}
