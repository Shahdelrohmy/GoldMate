import { Modal, Pressable, View } from 'react-native'
import { useTheme } from '../theme'
import { Button } from './Button'
import { Text } from './Text'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  message: string
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ visible, title, message, cancelLabel, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  const { colors, spacing, radius, layout } = useTheme()
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing[4] }}
      >
        <Pressable
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxWidth: 390,
            padding: spacing[6],
            gap: spacing[4],
            borderRadius: radius.card,
            borderWidth: layout.stroke,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="label" tone="muted">
            {message}
          </Text>
          <View style={{ gap: spacing[2] }}>
            <Button title={cancelLabel} variant="outline" fullWidth onPress={onCancel} />
            <Button title={confirmLabel} variant="danger" fullWidth onPress={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
