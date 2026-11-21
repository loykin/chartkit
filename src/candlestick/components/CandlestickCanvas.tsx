import { useCallback, useEffect, useMemo, useRef } from 'react'
import type uPlot from 'uplot'
import {
  CHART_DEFAULT_LINE_WIDTH,
  makeAxisBorderPlugin,
  resolveAxisStyles,
  selectionPlugin,
  useChart,
} from '../../core'
import type { AxisConfig, ChartFormatters, LineStyle, SelectionMode, SelectionResult } from '../../core'
import type { CandlestickDataPoint } from '../types'
import { candlestickPlugin } from '../utils/candlestickPlugin'

interface CandlestickCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  data: CandlestickDataPoint[]
  height: number | 'fill'
  upColor: string
  downColor: string
  candleWidth: number
  showVolume: boolean
  volumeHeight: number
  yUnit?: string
  locale?: string
  showXAxis: boolean
  yMin?: number
  yMax?: number
  gridStyle?: LineStyle | false
  axisStyle?: AxisConfig | false
  selectionMode: SelectionMode
  timeRange?: [number, number]
  onSelect?: (result: SelectionResult) => void
  onCursorMove?: (chart: uPlot, idx: number | null) => void
  formatters: ChartFormatters
}

export function CandlestickCanvas({
  containerRef,
  data,
  height,
  upColor,
  downColor,
  candleWidth,
  showVolume,
  volumeHeight,
  yUnit,
  locale,
  showXAxis,
  yMin,
  yMax,
  gridStyle,
  axisStyle,
  selectionMode,
  timeRange,
  onSelect,
  onCursorMove,
  formatters,
}: CandlestickCanvasProps) {
  const formattersRef = useRef(formatters)
  formattersRef.current = formatters

  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    const yValues: uPlot.Axis['values'] = (_u, values) => values.map(value => {
      if (value == null) return ''
      return formattersRef.current.value?.(value, {
        chartType: 'candlestick', purpose: 'axis', axis: 'y', unit: yUnit, locale,
      }) ?? `${value.toLocaleString(locale)}${yUnit ? `\u202f${yUnit}` : ''}`
    })

    return {
      width: 300,
      height: height === 'fill' ? 300 : height,
      drawOrder: ['axes', 'series'] as uPlot.DrawOrderKey[],
      legend: { show: false },
      cursor: {
        drag: { x: false, y: false },
        points: { show: false },
      },
      scales: {
        x: timeRange ? { min: timeRange[0], max: timeRange[1] } : {},
        y: { min: yMin, max: yMax },
      },
      axes: [
        {
          show: showXAxis,
          space: 70,
          size: showXAxis ? 48 : 0,
          stroke: mutedFgColor,
          ticks: resolvedTicks,
          grid: resolvedGrid,
          values: (_u, values) => values.map(value => {
            if (value == null) return ''
            return formattersRef.current.time?.(value, {
              chartType: 'candlestick', purpose: 'axis', axis: 'x', locale,
            }) ?? new Date(value * 1000).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
          }),
        },
        {
          size: yUnit ? 72 : 60,
          stroke: mutedFgColor,
          ticks: resolvedTicks,
          grid: resolvedGrid,
          values: yValues,
        },
      ],
      series: [
        {},
        { label: 'High', paths: () => null, points: { show: false } },
        { label: 'Low', paths: () => null, points: { show: false } },
      ],
      plugins: [
        candlestickPlugin({ data, upColor, downColor, candleWidth, showVolume, volumeHeight }),
        makeAxisBorderPlugin(axisLineStyle, axisColor, CHART_DEFAULT_LINE_WIDTH),
        selectionPlugin({ mode: selectionMode, onSelect }),
        ...(onCursorMove ? [{
          hooks: {
            setCursor: [(chart: uPlot) => onCursorMove(chart, chart.cursor.idx ?? null)],
          },
        }] : []),
      ],
    }
  }, [data, height, upColor, downColor, candleWidth, showVolume, volumeHeight, yUnit, locale, showXAxis, yMin, yMax, gridStyle, axisStyle, selectionMode, timeRange, onSelect, onCursorMove])

  const alignedData = useMemo<uPlot.AlignedData>(() => [
    data.map(candle => candle.time),
    data.map(candle => candle.high),
    data.map(candle => candle.low),
  ], [data])

  const chartRef = useChart({ containerRef, getOptions, data: alignedData, fillParent: height === 'fill' })
  useEffect(() => { chartRef.current?.redraw() }, [chartRef, formatters])

  return null
}
