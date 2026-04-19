// Charts
export { TimeSeriesChart } from './time-series'
export { HistogramChart  } from './histogram'
export { HeatmapChart    } from './heatmap'
export { ScatterChart    } from './scatter'
export { BoxPlotChart    } from './boxplot'
export { PieChart        } from './pie'

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

// Heatmap types & utilities
export type { HeatmapChartProps, HeatmapBinnedData } from './heatmap'
export { GRAD_METAL, binHeatmap } from './heatmap'

// Scatter types
export type { ScatterChartProps, ScatterSeriesConfig } from './scatter'

// Box plot types
export type { BoxPlotChartProps, BoxSeriesConfig, BoxStats } from './boxplot'

// Pie types
export type { PieChartProps, PieSliceConfig, PieLabelType } from './pie'

// Shared primitives (re-exported for consumers who compose custom charts)
export type {
  BaseChartProps,
  LineStyle,
  AxisConfig,
  SelectionMode,
  SelectionResult,
} from './core'
