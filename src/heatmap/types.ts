import type { BaseChartProps, LineStyle, AxisConfig } from '../core'

export interface HeatmapChartProps extends BaseChartProps {
  // ── Data ─────────────────────────────────────────────────────────────────
  /**
   * Flat array of x values (Unix seconds when xTime = true).
   * Must be the same length as ys.
   */
  xs: number[]
  /**
   * Flat array of y values corresponding to each x.
   * Must be the same length as xs.
   */
  ys: number[]

  // ── Binning ───────────────────────────────────────────────────────────────
  /** Width of each x bin (seconds when xTime = true) */
  xBinSize: number
  /** Height of each y bin (in y-value units) */
  yBinSize: number

  // ── Axes ──────────────────────────────────────────────────────────────────
  /** x axis is time — enables timestamp formatting (default true) */
  xTime?: boolean
  /** Locale for x-axis time formatting (default: browser locale) */
  locale?: string
  /** Unit label for the y axis */
  yUnit?: string

  // ── Appearance ────────────────────────────────────────────────────────────
  /**
   * Color palette array (low → high density).
   * Defaults to GRAD_METAL (purple → orange gradient, 15 colors).
   */
  palette?: string[]

  // ── Layout ────────────────────────────────────────────────────────────────
  gridStyle?: LineStyle | false
  axisStyle?: AxisConfig | false
}
