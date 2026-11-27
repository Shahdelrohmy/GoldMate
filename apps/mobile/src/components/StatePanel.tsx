import { View } from 'react-native'
import { useTheme } from '../theme'
import { Button } from './Button'
import { Card } from './Card'
import { Icon, type IconName } from './Icon'
import { Text } from './Text'

type StatePanelProps = {
  kind: 'loading' | 'error' | 'empty'
  title: string
  body?: string
  actionLabel?: string
  onAction?: () => void
  icon?: IconName
}

// One place for the loading / error / empty look, used by every data screen.
export function StatePanel({ kind, title, body, actionLabel, onAction, icon = 'vault' }: StatePanelProps) {
  const { colors, spacing, radius } = useTheme()
  if (kind === 'loading') {
    return (
      <View accessibilityRole="progressbar" accessibilityLabel={title} style={{ gap: spacing[3] }}>
        <Text variant="label" tone="muted">
          {title}
        </Text>
        {[1, 2, 3].map((id) => (
          <View
            key={id}
            style={{
              height: 96,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.cardRaised,
            }}
          />
        ))}
      </View>
    )
  }
  return (
    <Card flat style={{ padding: spacing[6], alignItems: 'center', gap: spacing[3] }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.card,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cardRaised,
        }}
      >
        <Icon name={kind === 'error' ? 'info' : icon} size={30} color={kind === 'error' ? colors.dangerText : colors.goldSoft} />
      </View>
      <Text variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {body ? (
        <Text variant="label" tone="muted" style={{ textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} fullWidth onPress={onAction} /> : null}
    </Card>
  )
}
