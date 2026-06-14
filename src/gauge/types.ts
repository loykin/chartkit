import type { Threshold } from '../core'

export interface GaugeChartProps {
  /** Current value */
  value: number
  /** Minimum of the gauge range. Default 0 */
  min?: number
  /** Maximum of the gauge range. Default 100 */
  max?: number
  /** Unit suffix shown inside the gauge below the value */
  unit?: string
  /** Label shown at the bottom of the gauge */
  label?: string
  /**
   * Color zones. The arc background is painted in threshold segments.
   * The needle/fill uses the color of the active threshold.
   * Default: single blue zone.
   */
  thresholds?: Threshold[]
  /** Arc thickness as a fraction of the radius. Default 0.18 */
  arcWidth?: number
  /** Canvas height in px, or `'fill'` to expand to the parent container's height. Default 200. */
  height?: number | 'fill'
  isLoading?: boolean
  error?: Error | null
}
