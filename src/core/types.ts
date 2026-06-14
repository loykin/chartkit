/** Line appearance: width, color, dash pattern */
export interface LineStyle {
  /** Line width in CSS px. 0.5 = hairline on Retina (default 0.5) */
  width?:  number
  /** CSS color string. Defaults to the theme's border color */
  stroke?: string
  /** Dash pattern, e.g. [4, 2] for dashed, [2, 2] for dotted. Solid if omitted */
  dash?:   number[]
}

/**
 * Axis line configuration — controls the border line and its tick marks together.
 * Pass `false` at the top level to hide both line and ticks entirely.
 */
export interface AxisConfig {
  /** Style of the axis border line itself (left vertical + bottom horizontal). */
  line?: LineStyle | false
  /** Style of the tick marks on the axis. `false` = hide ticks. */
  ticks?: LineStyle | false
}

export type SelectionMode = 'x' | 'y' | 'xy' | 'none'

/** What the generic selection plugin emits — raw data-space values */
export interface SelectionResult {
  xRange?: [number, number]
  yRange?: [number, number]
}

/** A single threshold: at `value` the color transitions */
export interface Threshold {
  /** The boundary value at which this color activates */
  value: number
  /** CSS color string */
  color: string
  /** Optional label drawn near the line (TimeSeriesChart only) */
  label?: string
  /** Line width in px (default 1, TimeSeriesChart only) */
  width?: number
  /** Dash pattern e.g. [4, 2] (TimeSeriesChart only) */
  dash?: number[]
}

/** Shared props common to all chart components */
export interface BaseChartProps {
  /**
   * Canvas height. Pass a number for a fixed px height, or `'fill'` to expand
   * to the parent container's height (parent must have an explicit height).
   * Default varies per chart (typically 300).
   */
  height?: number | 'fill'
  /** Grid lines inside the plot area. `false` = hide */
  gridStyle?: LineStyle | false
  /** Axis border + ticks. `false` = hide both */
  axisStyle?: AxisConfig | false
  /** Primary y-axis minimum (default: auto) */
  yMin?:      number
  /** Primary y-axis maximum (default: auto) */
  yMax?:      number
  isLoading?: boolean
  error?:     Error | null
}
