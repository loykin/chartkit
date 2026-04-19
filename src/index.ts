// Charts
export { TimeSeriesChart } from './time-series'
export { HistogramChart  } from './histogram'
export { HeatmapChart    } from './heatmap'
export { ScatterChart    } from './scatter'
export { BoxPlotChart    } from './boxplot'
export { PieChart        } from './pie'
export { StatChart       } from './stat'
export { GaugeChart      } from './gauge'
export { BarChart        } from './bar'

// Time-series types
export type {
  TimeSeriesChartProps,
  SeriesConfig,
  LegendPosition,
  LegendFormat,
  LegendItem,
  AlignedData,
  TooltipPayload,
  Threshold,
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

// Stat types
export type { StatChartProps } from './stat'

// Gauge types
export type { GaugeChartProps } from './gauge'

// Bar types
export type { BarChartProps, BarSeriesConfig } from './bar'

// Shared primitives (re-exported for consumers who compose custom charts)
export type {
  BaseChartProps,
  LineStyle,
  AxisConfig,
  SelectionMode,
  SelectionResult,
} from './core'
