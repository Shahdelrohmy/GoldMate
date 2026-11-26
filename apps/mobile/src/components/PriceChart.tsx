import { useState } from 'react'
import { View, type LayoutChangeEvent } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { useTheme } from '../theme'

type PriceChartProps = {
  /** Price points from old to new. */
  points: number[]
  height?: number
  /** Screen reader text (translated by the caller). */
  accessibilityLabel: string
}

// Simple line chart (grid + gold line + soft fill + last point). Draws only what it is given.
export function PriceChart({ points, height = 132, accessibilityLabel }: PriceChartProps) {
  const { colors, layout } = useTheme()
  const [width, setWidth] = useState(0)
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)

  let line = ''
  let area = ''
  let last = { x: 0, y: 0 }
  if (width > 0 && points.length > 1) {
    const min = Math.min(...points)
    const max = Math.max(...points)
    const span = max - min || 1
    const pad = 12
    const coords = points.map((value, index) => ({
      x: (index / (points.length - 1)) * width,
      y: pad + (1 - (value - min) / span) * (height - pad * 2),
    }))
    line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
    area = `${line} L${width} ${height} L0 ${height} Z`
    last = coords[coords.length - 1]
  }

  return (
    <View onLayout={onLayout} accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height} style={{ overflow: 'visible' }}>
          {[0.18, 0.5, 0.82].map((fraction) => (
            <Path
              key={fraction}
              d={`M0 ${height * fraction} H${width}`}
              stroke={colors.border}
              strokeWidth={layout.stroke}
              strokeDasharray="4 4"
            />
          ))}
          <Path d={area} fill={colors.gold} fillOpacity={0.12} />
          <Path d={line} fill="none" stroke={colors.gold} strokeWidth={layout.strokeStrong} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={last.x} cy={last.y} r={4} fill={colors.gold} stroke={colors.card} strokeWidth={4} />
        </Svg>
      ) : null}
    </View>
  )
}
