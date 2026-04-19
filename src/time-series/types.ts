import type React from 'react'
import type uPlot from 'uplot'
import type { LineStyle, AxisConfig, SelectionMode, SelectionResult, BaseChartProps } from '../core'

// uPlot's aligned data format:
// [timestamps, series1, series2, ...]  — all arrays must be the same length.
// Timestamps are unix seconds (number).
export type AlignedData = uPlot.AlignedData

// Re-export shared chart primitives from core so consumers can import from one place
export type { LineStyle, AxisConfig, SelectionMode, SelectionResult }

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'none'

/**
 * 'list'  — colored labels in a row / column (default)
 * 'table' — structured table with Min / Max / Avg / Last columns
 */
export type LegendFormat = 'list' | 'table'

export interface SeriesConfig {
  /** Display name shown in the legend */
  label: string
  /** Line / fill color (hex or CSS color string) */
  color: string
  /** Value unit shown in legend cells, e.g. "ms", "%" */
  unit?: string
  /** Line stroke width in px (default 1.5) */
  width?: number
  /** Chart type for this series (default: 'line') */
  type?: 'line' | 'area' | 'bars' | 'points'
  /** Fill opacity 0–1. Defaults: area=0.15, bars=1 */
  fillOpacity?: number
  /** Vertical gradient fill — fades from fillOpacity at top to 0 at bottom (area only) */
  fillGradient?: boolean
  /** Show data point dots on line / area series. Default: false */
  pointShow?: boolean
  /** Dot radius in px (default 4, points type default 6) */
  pointSize?: number
  /** Bar width as a fraction of x-axis spacing 0–1 (default 0.6) */
  barWidth?: number
  /** Dash pattern, e.g. [4, 2] for dashed lines */
  dash?: number[]
  /** Which y-axis to bind this series to (default: 'left') */
  yAxis?: 'left' | 'right'
}

export interface TimeSeriesChartProps extends BaseChartProps {
  // ── Data ─────────────────────────────────────────────────────────────────
  /** AlignedData: [timestamps, ...series] */
  data: AlignedData
  /** One entry per data series (data[1], data[2], …) */
  series: SeriesConfig[]

  // ── Layout ───────────────────────────────────────────────────────────────
  /** Where to render the legend (default 'bottom') */
  legendPosition?: LegendPosition
  /** Legend display mode (default 'list') */
  legendFormat?: LegendFormat

  // ── Y-axis ───────────────────────────────────────────────────────────────
  /** Unit suffix on the primary y-axis, e.g. 'ms', 'req/s' */
  yUnit?: string
  /** How to display yUnit: 'label' = rotated axis label, 'tick' = appended to each tick (default 'label') */
  yUnitDisplay?: 'label' | 'tick'
  /** Unit suffix on the secondary (right) y-axis */
  yUnit2?: string
  /** Secondary y-axis minimum */
  y2Min?: number
  /** Secondary y-axis maximum */
  y2Max?: number

  // ── X-axis ───────────────────────────────────────────────────────────────
  /** Show date on a second line when it changes (default true) */
  xShowDate?: boolean
  /** Locale for date formatting (default: browser locale) */
  locale?: string

  // ── Bar stacking ─────────────────────────────────────────────────────────
  barStack?: boolean

  // ── Selection ────────────────────────────────────────────────────────────
  selectionMode?: SelectionMode
  onSelect?: (selection: { timeRange?: [number, number]; yRange?: [number, number] }) => void

  // ── Controlled time range ─────────────────────────────────────────────────
  timeRange?: [number, number]
  onTimeRangeChange?: (range: [number, number]) => void

  // ── Custom legend ────────────────────────────────────────────────────────
  renderLegend?: (items: import('./hooks/useLegendState').LegendItem[]) => React.ReactNode

  // ── Custom tooltip ───────────────────────────────────────────────────────
  renderTooltip?: (payload: TooltipPayload) => React.ReactNode
}

/**
 * Payload passed to `renderTooltip`. All coordinates are relative to the
 * chart wrapper element so consumers can use them directly with
 * `position: absolute`.
 */
export interface TooltipPayload {
  /** Series values and stats at the current cursor position */
  items: import('./hooks/useLegendState').LegendItem[]
  /** Unix timestamp (seconds) at cursor — null when cursor is off-chart */
  timestamp: number | null
  /**
   * Cursor x in px relative to the chart wrapper div (y-axis space included).
   * Use as `style={{ left: x + offset }}` on an absolutely-positioned element.
   */
  x: number
  /**
   * Cursor y in px relative to the chart wrapper div.
   * Use as `style={{ top: y }}` on an absolutely-positioned element.
   */
  y: number
}
