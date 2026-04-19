import type { BaseChartProps } from '../core'

export interface HistogramProps extends BaseChartProps {
  /** Raw numeric values to bin and display */
  values: number[]

  /** Number of bins. Default: Sturges rule — ceil(log₂(n) + 1) */
  bins?: number

  /** Bar color (hex, default '#3b82f6') */
  color?: string

  /** Bar fill opacity 0–1 (default 0.8) */
  fillOpacity?: number

  /** Normalize y-axis to relative frequency 0–100% instead of count */
  normalize?: boolean

  /** Unit suffix on x-axis ticks, e.g. 'ms', '°C' */
  xUnit?: string

  /** Unit suffix on y-axis ticks — ignored when normalize=true (shows '%') */
  yUnit?: string
}

/** Output of useBins */
export interface BinResult {
  /** Left edge of each bin (used as x values in uPlot) */
  edges:    number[]
  /** Count (or frequency when normalize=true) per bin */
  counts:   number[]
  /** Bin width */
  binWidth: number
}
