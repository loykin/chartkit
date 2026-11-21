import type React from 'react'

export type ChartType =
  | 'bar'
  | 'boxplot'
  | 'candlestick'
  | 'gauge'
  | 'heatmap'
  | 'histogram'
  | 'pie'
  | 'scatter'
  | 'stat'
  | 'timeseries'

export type ChartFormatPurpose = 'axis' | 'legend' | 'tooltip' | 'label'

export interface ChartFormatterContext {
  chartType: ChartType
  purpose: ChartFormatPurpose
  seriesId?: string
  seriesLabel?: string
  axis?: 'x' | 'y' | 'y2'
  unit?: string
  locale?: string
  timeZone?: string
}

export interface ChartFormatters {
  value?: (value: number, context: ChartFormatterContext) => string
  time?: (unixSeconds: number, context: ChartFormatterContext) => string
  label?: (label: string, context: ChartFormatterContext) => string
  percentage?: (percentage: number, context: ChartFormatterContext) => string
}

export interface ChartTooltipItem {
  /** Stable consumer-provided identity when available. */
  id?: string
  /** Zero-based item position in the chart input. Not a stable identity. */
  itemIndex: number
  label: string
  color?: string
  value: number | null
  formattedValue: string
  percentage?: number
}

export interface ChartTooltipPayload {
  chartType: ChartType
  items: readonly ChartTooltipItem[]
  x: number
  y: number
  datumIndex?: number
  xValue?: number | string | null
  formattedXValue?: string
}

export type ChartTooltipRenderer = (payload: ChartTooltipPayload) => React.ReactNode

export interface ChartKitPlugin {
  name?: string
  formatters?: ChartFormatters
  tooltip?: {
    render?: ChartTooltipRenderer
  }
}

export interface ChartKitRuntime {
  formatters: ChartFormatters
  renderTooltip?: ChartTooltipRenderer
}
