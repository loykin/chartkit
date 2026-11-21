// Spec layer (AI-friendly declarative interface)
export { ChartRenderer, CHART_SPEC_SCHEMA, CHART_SPEC_DESCRIPTION } from './spec'
export type {
  ChartSpec,
  ChartRendererProps,
  BarChartSpec,
  BarGaugeSpec,
  PieChartSpec,
  ScatterChartSpec,
  TimeSeriesSpec,
  CandlestickSpec,
  HistogramSpec,
  BoxPlotSpec,
  GaugeSpec,
  StatSpec,
  HeatmapSpec,
} from './spec'

// Charts
export { TimeSeriesChart } from './time-series'
export { CandlestickChart } from './candlestick'
export { HistogramChart  } from './histogram'
export { HeatmapChart    } from './heatmap'
export { ScatterChart    } from './scatter'
export { BoxPlotChart    } from './boxplot'
export { PieChart        } from './pie'
export { StatChart       } from './stat'
export { GaugeChart      } from './gauge'
export { BarChart        } from './bar'
export { BarGaugeChart   } from './bar-gauge'

// Runtime customization (functions stay outside the serializable ChartSpec)
export { ChartKitProvider, useChartKit } from './core'
export type {
  ChartKitProviderProps,
  ChartType,
  ChartFormatPurpose,
  ChartFormatterContext,
  ChartFormatters,
  ChartTooltipItem,
  ChartTooltipPayload,
  ChartTooltipRenderer,
  ChartKitPlugin,
  ChartKitRuntime,
} from './core'

// Time-series types
export type {
  TimeSeriesChartProps,
  SeriesConfig,
  LegendPosition,
  LegendFormat,
  LegendItem,
  AlignedData,
  TooltipPayload,
  TimeSeriesSyncConfig,
  TooltipPolicy,
  TooltipCursor,
  TimeSeriesMarker,
  TimeSeriesRegion,
  Threshold,
} from './time-series'

// Candlestick types
export type {
  CandlestickChartProps,
  CandlestickDataPoint,
  CandlestickTooltipPayload,
} from './candlestick'

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
export type {
  PieChartProps,
  PieSliceConfig,
  PieLabelType,
  PieTooltipPayload,
  PieSliceEvent,
  PieLegendItemEvent,
  PieLegendItem,
} from './pie'

// Stat types
export type { StatChartProps } from './stat'

// Gauge types
export type { GaugeChartProps } from './gauge'

// Bar types
export type { BarChartProps, BarSeriesConfig } from './bar'
export type { BarGaugeChartProps, BarGaugeItem } from './bar-gauge'

// Shared primitives (re-exported for consumers who compose custom charts)
export type {
  BaseChartProps,
  ChartStateRenderers,
  LineStyle,
  AxisConfig,
  SelectionMode,
  SelectionResult,
} from './core'
