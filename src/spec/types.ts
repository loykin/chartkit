import type { BarChartProps } from '../bar'
import type { PieChartProps } from '../pie'
import type { ScatterChartProps } from '../scatter'
import type { TimeSeriesChartProps } from '../time-series'
import type { HistogramProps } from '../histogram'
import type { BoxPlotChartProps } from '../boxplot'
import type { GaugeChartProps } from '../gauge'
import type { StatChartProps } from '../stat'
import type { HeatmapChartProps } from '../heatmap'
import type { CandlestickChartProps } from '../candlestick'

type OmitRuntime<T> = Omit<T, 'isLoading' | 'error' | 'formatters' | 'height'> & {
  height?: number
}

type OmitPieRuntime = Omit<OmitRuntime<PieChartProps>, 'renderTooltip'>

type OmitTimeSeriesRuntime = Omit<
  OmitRuntime<TimeSeriesChartProps>,
  'renderLegend' | 'renderTooltip' | 'onSelect' | 'onTimeRangeChange'
>

type OmitCandlestickRuntime = Omit<
  OmitRuntime<CandlestickChartProps>,
  'renderTooltip' | 'onSelect' | 'onTimeRangeChange'
>

export type BarChartSpec     = { type: 'bar'        } & OmitRuntime<BarChartProps>
export type PieChartSpec     = { type: 'pie'        } & OmitPieRuntime
export type ScatterChartSpec = { type: 'scatter'    } & OmitRuntime<ScatterChartProps>
export type TimeSeriesSpec   = { type: 'timeseries' } & OmitTimeSeriesRuntime
export type CandlestickSpec  = { type: 'candlestick' } & OmitCandlestickRuntime
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
  | CandlestickSpec
  | HistogramSpec
  | BoxPlotSpec
  | GaugeSpec
  | StatSpec
  | HeatmapSpec
