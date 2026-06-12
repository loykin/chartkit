import type { BarChartProps } from '../bar'
import type { PieChartProps } from '../pie'
import type { ScatterChartProps } from '../scatter'
import type { TimeSeriesChartProps } from '../time-series'
import type { HistogramProps } from '../histogram'
import type { BoxPlotChartProps } from '../boxplot'
import type { GaugeChartProps } from '../gauge'
import type { StatChartProps } from '../stat'
import type { HeatmapChartProps } from '../heatmap'

type OmitRuntime<T> = Omit<T, 'isLoading' | 'error'>

type OmitTimeSeriesRuntime = Omit<
  TimeSeriesChartProps,
  'isLoading' | 'error' | 'renderLegend' | 'renderTooltip' | 'onSelect' | 'onTimeRangeChange'
>

export type BarChartSpec     = { type: 'bar'        } & OmitRuntime<BarChartProps>
export type PieChartSpec     = { type: 'pie'        } & OmitRuntime<PieChartProps>
export type ScatterChartSpec = { type: 'scatter'    } & OmitRuntime<ScatterChartProps>
export type TimeSeriesSpec   = { type: 'timeseries' } & OmitTimeSeriesRuntime
export type HistogramSpec    = { type: 'histogram'  } & OmitRuntime<HistogramProps>
export type BoxPlotSpec      = { type: 'boxplot'    } & OmitRuntime<BoxPlotChartProps>
export type GaugeSpec        = { type: 'gauge'      } & OmitRuntime<GaugeChartProps>
export type StatSpec         = { type: 'stat'       } & OmitRuntime<StatChartProps>
export type HeatmapSpec      = { type: 'heatmap'    } & OmitRuntime<HeatmapChartProps>

export type ChartSpec =
  | BarChartSpec
  | PieChartSpec
  | ScatterChartSpec
  | TimeSeriesSpec
  | HistogramSpec
  | BoxPlotSpec
  | GaugeSpec
  | StatSpec
  | HeatmapSpec
