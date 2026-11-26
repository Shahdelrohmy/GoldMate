import { I18nManager } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { useTheme } from '../theme'

type Shape =
  | { kind: 'path'; d: string }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }

const p = (d: string): Shape => ({ kind: 'path', d })
const rect = (x: number, y: number, width: number, height: number, rx: number): Shape => ({ kind: 'rect', x, y, width, height, rx })
const circle = (cx: number, cy: number, r: number): Shape => ({ kind: 'circle', cx, cy, r })

// Same 24x24 line icons as the Figma Make export.
const icons = {
  mail: [rect(3, 5, 18, 14, 3), p('m4 7 8 6 8-6')],
  lock: [rect(4, 10, 16, 11, 3), p('M8 10V7a4 4 0 0 1 8 0v3M12 14v3')],
  user: [circle(12, 8, 4), p('M4.5 21a7.5 7.5 0 0 1 15 0')],
  eye: [p('M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z'), circle(12, 12, 2.5)],
  eyeOff: [p('m3 3 18 18M10.6 6.1A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.7M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5')],
  moon: [p('M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.5 8.5 0 1 0 12 12Z')],
  sun: [circle(12, 12, 4), p('M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4')],
  shield: [p('M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z'), p('m9 12 2 2 4-4')],
  prices: [p('M4 19V9M10 19V5M16 19v-7M22 19V3'), p('M2 19h22')],
  vault: [rect(3, 4, 18, 16, 3), circle(12, 12, 3), p('M12 9V7M15 12h2M12 15v2M9 12H7')],
  zakat: [p('M12 3v18M7 7h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8')],
  calculator: [rect(4, 2, 16, 20, 3), p('M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01')],
  settings: [circle(12, 12, 3), p('M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6v.2H10V21a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1L4 17.1l.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 13.9h-.2V10H3a1.8 1.8 0 0 0 1.5-1.1 1.8 1.8 0 0 0-.4-2L4 6.8 6.8 4l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3V2.8h4V3a1.8 1.8 0 0 0 1.1 1.5 1.8 1.8 0 0 0 2-.4l.1-.1L20 6.8l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 10h.2v3.9H21a1.8 1.8 0 0 0-1.6 1.1Z')],
  coin: [circle(12, 12, 8), circle(12, 12, 5), p('M9 12h6M12 9v6')],
  bar: [p('m6 7-3 10h18L18 7H6Z'), p('M8 11h8')],
  jewelry: [p('m4 9 4-5h8l4 5-8 11L4 9Z'), p('m8 4 4 5 4-5M4 9h16')],
  check: [p('m5 12 4 4L19 6')],
  plus: [p('M12 5v14M5 12h14')],
  chevron: [p('m15 18-6-6 6-6')], // points left
  refresh: [p('M20 7v5h-5'), p('M4 17v-5h5M6.1 8a7 7 0 0 1 11.6-2.4L20 8M4 16l2.3 2.4A7 7 0 0 0 18 16')],
  camera: [p('M4 7h3l2-3h6l2 3h3v13H4V7Z'), circle(12, 13, 4)],
  info: [circle(12, 12, 9), p('M12 11v5M12 8h.01')],
} satisfies Record<string, Shape[]>

export type IconName = keyof typeof icons

type IconProps = {
  name: IconName
  size?: number
  /** Defaults to the main text color of the current theme. */
  color?: string
  /** Flip the icon horizontally when the app direction matches. Back arrow: 'rtl'. Forward arrow: 'ltr'. */
  mirror?: 'rtl' | 'ltr'
}

export function Icon({ name, size = 20, color, mirror }: IconProps) {
  const { colors } = useTheme()
  const stroke = color ?? colors.text
  const appDirection = I18nManager.isRTL ? 'rtl' : 'ltr'
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={mirror === appDirection ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      {icons[name].map((shape, index) =>
        shape.kind === 'path' ? (
          <Path key={index} d={shape.d} />
        ) : shape.kind === 'rect' ? (
          <Rect key={index} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} />
        ) : (
          <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />
        ),
      )}
    </Svg>
  )
}
