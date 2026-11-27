import { Pressable, View } from 'react-native'
import { Badge, Card, Icon, Screen, ScreenHeader, StatePanel, Text, UtilityActions, type IconName } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'
import type { PieceSource, VaultPiece, VaultSummary, ViewStatus } from '../types'
import { formatNumber, formatPercent } from '../utils/format'

type VaultScreenProps = {
  status: ViewStatus
  summary?: VaultSummary
  pieces: VaultPiece[]
  onAdd: () => void
  onRetry?: () => void
}

type Metric = { label: string; value: string; hint?: string; tone?: 'default' | 'profit' | 'loss' }

export function VaultScreen({ status, summary, pieces, onAdd, onRetry }: VaultScreenProps) {
  const { t, language } = useLanguage()
  const { colors, spacing, radius, layout, shadows } = useTheme()
  const money = (value: number) => t('money', { value: formatNumber(value, language) })
  const weight = (value: number) => t('weightValue', { value: formatNumber(value, language, 1) })
  const showEmpty = status === 'empty' || (status === 'ready' && pieces.length === 0)

  const sourceLabel: Record<PieceSource, string> = { verified: t('shopVerified'), ai: t('aiReviewed'), manual: t('manual') }
  const typeLabel = { coin: t('coin'), bar: t('bar'), jewelry: t('jewelry') }
  const typeIcon: Record<VaultPiece['type'], IconName> = { coin: 'coin', bar: 'bar', jewelry: 'jewelry' }

  const metrics: Metric[] = summary
    ? [
        { label: t('totalGoldWeight'), value: weight(summary.totalWeightG) },
        { label: t('pureWeight'), value: weight(summary.pureWeightG), hint: t('equivalent') },
        { label: t('totalInvested'), value: money(summary.totalInvested) },
        { label: t('averageCost'), value: money(summary.averageCostPerGram) },
        { label: t('estimatedValue'), value: money(summary.currentValue) },
        { label: t('sellingValue'), value: money(summary.sellingValue), hint: t('afterSpread') },
        {
          label: t('profitLoss'),
          value: `${summary.profitLoss > 0 ? '+' : ''}${money(summary.profitLoss)}`,
          tone: summary.profitLoss < 0 ? 'loss' : 'profit',
        },
        { label: t('breakEven'), value: t('moneyPerGram', { value: formatNumber(summary.breakEvenPerGram, language) }) },
      ]
    : []

  return (
    <Screen
      floatingAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('addPiece')}
          onPress={onAdd}
          style={{
            width: layout.touchTarget + spacing[2],
            height: layout.touchTarget + spacing[2],
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: colors.gold,
            ...shadows.gold,
          }}
        >
          <Icon name="plus" size={26} color={colors.onGold} />
        </Pressable>
      }
    >
      <ScreenHeader title={t('myVault')} actions={<UtilityActions />} />

      {status === 'loading' || status === 'error' ? (
        <StatePanel
          kind={status}
          title={status === 'loading' ? t('loading') : t('errorTitle')}
          body={status === 'error' ? t('errorBody') : undefined}
          actionLabel={status === 'error' ? t('retry') : undefined}
          onAction={onRetry}
        />
      ) : showEmpty ? (
        <StatePanel kind="empty" icon="vault" title={t('emptyVaultTitle')} body={t('emptyBody')} actionLabel={t('addPiece')} onAction={onAdd} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text variant="heading">{t('vaultSummary')}</Text>
            {summary ? <Badge label={formatPercent(summary.returnPct, language)} tone={summary.returnPct < 0 ? 'loss' : 'profit'} /> : null}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {metrics.map((metric) => (
              <Card key={metric.label} flat style={{ flexBasis: '48%', flexGrow: 1, minHeight: spacing[12] * 2, padding: spacing[3] }}>
                <Text variant="caption" tone="muted">
                  {metric.label}
                </Text>
                <Text variant="body" weight="semibold" tone={metric.tone} style={{ marginTop: spacing[3] }}>
                  {metric.value}
                </Text>
                {metric.hint ? (
                  <Text variant="caption" tone="muted" style={{ marginTop: spacing[1] }}>
                    {metric.hint}
                  </Text>
                ) : null}
              </Card>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[3] }}>
            <Icon name="info" size={14} color={colors.muted} />
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {t('estimatesFooter')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[6], marginBottom: spacing[3] }}>
            <Text variant="heading">{t('pieces')}</Text>
            <Text variant="caption" tone="muted">
              {t('piecesCount', { count: formatNumber(pieces.length, language) })}
            </Text>
          </View>
          <View style={{ gap: spacing[3], paddingBottom: spacing[12] * 2 }}>
            {pieces.map((piece) => (
              <Card key={piece.id} flat style={{ padding: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                <View
                  style={{
                    width: layout.touchTarget,
                    height: layout.touchTarget,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.md,
                    backgroundColor: colors.cardRaised,
                  }}
                >
                  <Icon name={typeIcon[piece.type]} color={colors.goldSoft} />
                </View>
                <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
                  <Text variant="label" numberOfLines={1}>
                    {typeLabel[piece.type]} {weight(piece.weightG)}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {t('karatLabel', { karat: formatNumber(piece.karat, language) })}
                  </Text>
                  <View style={{ marginTop: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
                    {piece.source === 'verified' ? <Icon name="check" size={12} color={colors.goldSoft} /> : null}
                    <Badge label={sourceLabel[piece.source]} />
                  </View>
                </View>
                <Text variant="label">{money(piece.price)}</Text>
              </Card>
            ))}
          </View>
        </>
      )}
    </Screen>
  )
}
