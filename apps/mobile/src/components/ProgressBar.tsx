import { View } from 'react-native'
import { useTheme } from '../theme'

type ProgressBarProps = {
  /** 0 to 1 */
  progress: number
  color?: string
  /** Optional marker line on the bar (0 to 1), used by the price check range. */
  marker?: number
}

export function ProgressBar({ progress, color, marker }: ProgressBarProps) {
  const { colors, spacing, radius } = useTheme()
  const clamp = (n: number) => Math.max(0, Math.min(1, n))
  return (
    <View style={{ height: spacing[3], borderRadius: radius.pill, backgroundColor: colors.border, marginVertical: spacing[2] }}>
      <View
        style={{
          width: `${clamp(progress) * 100}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color ?? colors.gold,
        }}
      />
      {marker !== undefined ? (
        <View
          style={{
            position: 'absolute',
            start: `${clamp(marker) * 100}%`,
            top: -spacing[1],
            height: spacing[3] + spacing[2],
            width: spacing[1],
            borderRadius: radius.sm,
            backgroundColor: colors.text,
          }}
        />
      ) : null}
    </View>
  )
}
