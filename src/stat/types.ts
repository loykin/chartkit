import type { Threshold } from '../core'

export interface StatChartProps {
  /** Current value */
  value: number | null
  /** Label shown above the value */
  label?: string
  /** Unit suffix appended to the value, e.g. 'ms', '%' */
  unit?: string
  /** Previous value used to compute the trend indicator */
  previousValue?: number
  /**
   * Color zones. The color of the highest threshold whose `value` is ≤
   * the displayed value is used. Ignored when `color` is set explicitly.
   */
  thresholds?: Threshold[]
  /** Override color (takes priority over thresholds) */
  color?: string
  /** Sparkline data — raw numeric values in order */
  sparkline?: number[]
  /** Sparkline stroke/fill color. Defaults to the resolved value color */
  sparklineColor?: string
  /** Component height in px, or `'fill'` to expand to the parent container's height. Default 120. */
  height?: number | 'fill'
  isLoading?: boolean
  error?: Error | null
}
