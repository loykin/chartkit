import { useCallback, useMemo } from 'react'
import uPlot from 'uplot'
import { useChart, selectionPlugin, hexToRgba, makeAxisBorderPlugin, resolveAxisStyles, CHART_DEFAULT_LINE_WIDTH, thresholdPlugin } from '../../core'
import type { SeriesConfig, SelectionMode, SelectionResult } from '../types'
import type { AxisConfig, LineStyle, Threshold } from '../../core'

interface ChartCanvasProps {
  containerRef:  React.RefObject<HTMLDivElement | null>
  data:          uPlot.AlignedData
  series:        SeriesConfig[]
  height:        number
  selectionMode: SelectionMode
  yUnit?:        string
  yUnitDisplay?: 'label' | 'tick'
  yMin?:         number
  yMax?:         number
  xShowDate?:    boolean
  locale?:       string
  gridStyle?:    LineStyle | false
  axisStyle?:    AxisConfig | false
  timeRange?:    [number, number]
  barStack?:     boolean
  yUnit2?:       string
  y2Min?:        number
  y2Max?:        number
  thresholds?:   Threshold[]
  onSelect?:     (result: SelectionResult) => void
  onReady?:      (chart: uPlot) => void
  onCursorMove?: (chart: uPlot, idx: number | null) => void
}

export function ChartCanvas({
  containerRef,
  data,
  series,
  height,
  selectionMode,
  yUnit,
  yUnitDisplay = 'label',
  yMin,
  yMax,
  xShowDate = true,
  locale,
  gridStyle,
  axisStyle,
  timeRange,
  barStack = false,
  yUnit2,
  y2Min,
  y2Max,
  thresholds,
  onSelect,
  onReady,
  onCursorMove,
}: ChartCanvasProps) {
  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    // Bar stacking: draw in reverse order (background → foreground)
    const isBarStack    = barStack && series.some(s => s.type === 'bars')
    const orderedSeries = isBarStack ? [...series].reverse() : series

    const uSeries: uPlot.Series[] = [
      {},  // x (timestamps)
      ...orderedSeries.map((s) => {
        const type     = s.type ?? 'line'
        const isArea   = type === 'area'
        const isBars   = type === 'bars'
        const isPoints = type === 'points'
        const opacity  = s.fillOpacity ?? (isArea ? 0.15 : 1)

        let fill: uPlot.Series['fill']
        if (isArea || isBars) {
          if (isArea && s.fillGradient) {
            fill = (u: uPlot) => {
              const { ctx, bbox } = u
              const grad = ctx.createLinearGradient(0, bbox.top, 0, bbox.top + bbox.height)
              grad.addColorStop(0, hexToRgba(s.color, opacity))
              grad.addColorStop(1, hexToRgba(s.color, 0))
              return grad
            }
          } else {
            fill = hexToRgba(s.color, opacity)
          }
        }

        return {
          label:  s.label,
          scale:  s.yAxis === 'right' ? 'y2' : 'y',
          stroke: isPoints ? undefined : s.color,
          width:  (isPoints || isBars) ? 0 : (s.width ?? 1.5),
          fill,
          dash:   s.dash,
          show:   true,
          points: isBars ? undefined : {
            show:  isPoints || (s.pointShow ?? false),
            fill:  s.color,
            size:  s.pointSize ?? (isPoints ? 6 : 4),
            width: 0,
          },
          paths: isBars
            ? (uPlot.paths.bars?.({ size: [s.barWidth ?? 0.6, 100] }))
            : undefined,
        }
      }),
    ]

    const hasRightAxis = series.some(s => s.yAxis === 'right')

    const scales: uPlot.Scales = {
      x:  timeRange ? { min: timeRange[0], max: timeRange[1] } : {},
      y:  { min: yMin,  max: yMax  },
      ...(hasRightAxis ? { y2: { min: y2Min, max: y2Max } } : {}),
    }

    const yInTickMode = yUnitDisplay === 'tick' && !!yUnit
    const yAxisValues: uPlot.Axis['values'] = yInTickMode
      ? (_u, vals) => vals.map((v) => {
          if (v == null) return ''
          const n = Math.abs(v) >= 1000
            ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : Number.isInteger(v) ? String(v) : v.toPrecision(3)
          return `${n}\u202f${yUnit}`
        })
      : undefined

    const y2InTickMode = yUnitDisplay === 'tick' && !!yUnit2
    const y2AxisValues: uPlot.Axis['values'] = y2InTickMode
      ? (_u, vals) => vals.map((v) => {
          if (v == null) return ''
          const n = Math.abs(v) >= 1000
            ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : Number.isInteger(v) ? String(v) : v.toPrecision(3)
          return `${n}\u202f${yUnit2}`
        })
      : undefined

    // X-axis time formatter.
    // xShowDate=true → shows date on a second line when the date changes.
    // locale controls toLocaleDateString (undefined = browser default).
    const xAxisValues: uPlot.Axis['values'] = (_u, vals) => {
      let lastDay = -1
      return vals.map((ts) => {
        if (ts == null) return null
        const d   = new Date(ts * 1000)
        const hh  = String(d.getHours()).padStart(2, '0')
        const mm  = String(d.getMinutes()).padStart(2, '0')
        const time = `${hh}:${mm}`

        if (!xShowDate) return time

        const day = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate()
        if (day !== lastDay) {
          lastDay = day
          const date = d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
          return `${time}\n${date}`
        }
        return time
      })
    }

    const axes: uPlot.Axis[] = [
      {
        space:  60,
        size:   xShowDate ? 60 : 32,
        stroke: mutedFgColor,
        values: xAxisValues,
        ticks:  resolvedTicks,
        grid:   resolvedGrid,
      },
      {
        scale:     'y',
        side:      3,  // left
        size:      yInTickMode ? 50 : 54,
        labelSize: 16,
        label:     yInTickMode ? undefined : yUnit,
        values:    yAxisValues,
        stroke:    mutedFgColor,
        ticks:     resolvedTicks,
        grid:      resolvedGrid,
      },
      ...(hasRightAxis ? [{
        scale:     'y2',
        side:      1,  // right
        size:      y2InTickMode ? 50 : 54,
        labelSize: 16,
        label:     y2InTickMode ? undefined : yUnit2,
        values:    y2AxisValues,
        stroke:    mutedFgColor,
        ticks:     resolvedTicks,
        grid:      { show: false } as uPlot.Axis.Grid,  // avoid double grid lines
      }] : []),
    ]

    return {
      width:     300,  // overridden by ResizeObserver in useChart
      height,
      drawOrder: ['axes', 'series'] as uPlot.DrawOrderKey[],
      legend:    { show: false },
      cursor:    {
        drag: { x: false, y: false },
        sync: { key: 'chart' },
      },
      series: uSeries,
      scales,
      axes,
      plugins: [
        makeAxisBorderPlugin(axisLineStyle, axisColor, CHART_DEFAULT_LINE_WIDTH),
        ...(thresholds?.length ? [thresholdPlugin(thresholds)] : []),
        selectionPlugin({ mode: selectionMode, onSelect }),
        ...(onCursorMove
          ? [{
              hooks: {
                setCursor: [(chart: uPlot) => {
                  onCursorMove(chart, chart.cursor.idx ?? null)
                }],
              },
            }]
          : []),
      ],
    }
  }, [series, height, selectionMode, yUnit, yUnitDisplay, xShowDate, locale, yMin, yMax, yUnit2, y2Min, y2Max, gridStyle, axisStyle, timeRange, barStack, thresholds, onSelect, onCursorMove])

  // Bar stacking: transform data to cumulative sums, then reverse order
  const resolvedData = useMemo<uPlot.AlignedData>(() => {
    const hasBars = series.some(s => s.type === 'bars')
    if (!barStack || !hasBars || data.length < 3) return data

    const timestamps = data[0]
    const arrays     = data.slice(1) as (number | null)[][]

    const cumulative = arrays.map((_, idx) =>
      (timestamps as number[]).map((__, i) => {
        let sum = 0
        for (let k = 0; k <= idx; k++) {
          const v = arrays[k][i]
          if (v != null) sum += v
        }
        return sum
      })
    )

    return [data[0], ...cumulative.reverse()] as uPlot.AlignedData
  }, [data, barStack, series])

  useChart({ containerRef, getOptions, data: resolvedData, onReady })

  return null
}
