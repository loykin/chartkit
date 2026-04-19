// Charts
export { TimeSeriesChart } from './time-series'
export { HistogramChart  } from './histogram'

// Time-series types
export type {
  TimeSeriesChartProps,
  SeriesConfig,
  LegendPosition,
  LegendFormat,
  LegendItem,
  AlignedData,
  TooltipPayload,
} from './time-series'

// Histogram types
export type {
  HistogramProps,
  BinResult,
} from './histogram'

// Shared primitives (re-exported for consumers who compose custom charts)
export type {
  BaseChartProps,
  LineStyle,
  AxisConfig,
  SelectionMode,
  SelectionResult,
} from './core'
