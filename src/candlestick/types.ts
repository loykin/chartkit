import type React from 'react'
import type { BaseChartProps, SelectionMode } from '../core'

export interface CandlestickDataPoint {
  /** Unix timestamp in seconds */
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface CandlestickTooltipPayload {
  candle: CandlestickDataPoint
  /** Cursor x in px relative to the chart wrapper */
  x: number
  /** Cursor y in px relative to the chart wrapper */
  y: number
}

export interface CandlestickChartProps extends BaseChartProps {
  data: CandlestickDataPoint[]
  /** Rising candle color (default #22c55e) */
  upColor?: string
  /** Falling candle color (default #ef4444) */
  downColor?: string
  /** Candle body width as a fraction of time spacing (default 0.65) */
  candleWidth?: number
  /** Draw volume bars behind the lower portion of the price plot (default true) */
  showVolume?: boolean
  /** Fraction of the plot height reserved visually for volume, 0–0.5 (default 0.2) */
  volumeHeight?: number
  /** Price unit shown on the y-axis and legend */
  yUnit?: string
  /** Browser locale used for dates and numbers */
  locale?: string
  /** Show the time axis below the plot (default true) */
  showXAxis?: boolean
  /** Show the current OHLCV values above the chart (default true) */
  showLegend?: boolean
  selectionMode?: SelectionMode
  onSelect?: (selection: { timeRange?: [number, number]; yRange?: [number, number] }) => void
  timeRange?: [number, number]
  onTimeRangeChange?: (range: [number, number]) => void
  renderTooltip?: (payload: CandlestickTooltipPayload) => React.ReactNode
}
