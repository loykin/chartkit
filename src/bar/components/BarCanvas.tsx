import { useCallback, useEffect, useMemo, useRef } from 'react'
import uPlot from 'uplot'
import {
  useChart, resolveAxisStyles, makeAxisBorderPlugin,
  CHART_DEFAULT_LINE_WIDTH, formatNum,
} from '../../core'
import type { AxisConfig, ChartFormatters, LineStyle } from '../../core'
import { barPlugin } from '../utils/barPlugin'
import type { BarSeriesConfig } from '../types'

interface BarCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  categories:  string[]
  series:      BarSeriesConfig[]
  orientation: 'vertical' | 'horizontal'
  stacked:     boolean
  height:      number | 'fill'
  xUnit?:      string
  yUnit?:      string
  yMin?:       number
  yMax?:       number
  gridStyle?:  LineStyle | false
  axisStyle?:  AxisConfig | false
  formatters:  ChartFormatters
}

export function BarCanvas({
  containerRef,
  categories,
  series,
  orientation,
  stacked,
  height,
  xUnit,
  yUnit,
  yMin,
  yMax,
  gridStyle,
  axisStyle,
  formatters,
}: BarCanvasProps) {
  const n = categories.length
  const formattersRef = useRef(formatters)
  formattersRef.current = formatters

  // Compute value range for auto-scaling
  const [computedMin, computedMax] = useMemo(() => {
    let lo = 0, hi = 0
    if (stacked) {
      const totals = Array.from({ length: n }, (_, ci) =>
        series.reduce((s, ser) => s + (ser.values[ci] ?? 0), 0),
      )
      hi = Math.max(...totals, 0)
    } else {
      for (const s of series) {
        for (const v of s.values) {
          if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v) }
        }
      }
    }
    return [lo, hi * 1.08]
  }, [series, stacked, n])

  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    const valMin = yMin ?? computedMin
    const valMax = yMax ?? computedMax

    // Vertical: x = categories, y = values
    // Horizontal: x = values, y = categories (swap axes)
    const isH = orientation === 'horizontal'

    const scales: uPlot.Scales = isH
      ? {
          x: { time: false, auto: false, range: [valMin, valMax] as [number, number] },
          y: { time: false, auto: false, range: [-0.5, n - 0.5] as [number, number] },
        }
      : {
          x: { time: false, auto: false, range: [-0.5, n - 0.5] as [number, number] },
          y: { range: [valMin, valMax] as [number, number] },
        }

    const catAxis: uPlot.Axis = {
      space:  isH ? 20 : 40,
      size:   isH ? 80 : 40,
      stroke: mutedFgColor,
      ticks:  { ...resolvedTicks, show: false },
      grid:   { show: false },
      splits: () => categories.map((_, i) => i),
      values: (_u, ticks) => ticks.map(t => {
        const label = categories[Math.round(t)] ?? ''
        return formattersRef.current.label?.(label, {
          chartType: 'bar', purpose: 'axis', axis: isH ? 'y' : 'x',
        }) ?? label
      }),
    }

    const valAxis: uPlot.Axis = {
      size:   54,
      stroke: mutedFgColor,
      ticks:  resolvedTicks,
      grid:   resolvedGrid,
      values: (_u, values) => values.map(value => {
        if (value == null) return ''
        const unit = isH ? xUnit : yUnit
        return formattersRef.current.value?.(value, {
          chartType: 'bar', purpose: 'axis', axis: isH ? 'x' : 'y', unit,
        }) ?? formatNum(value, unit)
      }),
    }

    return {
      width:  300,
      height: height === 'fill' ? 300 : height,
      legend: { show: false },
      cursor: { drag: { x: false, y: false }, points: { show: false } },
      scales,
      axes:   isH
        ? [valAxis, catAxis]    // x=values (bottom), y=categories (left)
        : [catAxis, valAxis],   // x=categories (bottom), y=values (left)
      series: [
        {},
        { paths: () => null, points: { show: false } },
      ],
      plugins: [
        barPlugin(series, orientation, stacked),
        makeAxisBorderPlugin(axisLineStyle, axisColor, CHART_DEFAULT_LINE_WIDTH),
      ],
    }
  }, [categories, series, orientation, stacked, height, xUnit, yUnit, yMin, yMax, gridStyle, axisStyle, computedMin, computedMax, n])

  // Dummy data: x indices + one zero series (plugin draws everything)
  const data = useMemo<uPlot.AlignedData>(() => {
    const xs = categories.map((_, i) => i)
    return [xs, xs.map(() => 0)]
  }, [categories])

  const chartRef = useChart({ containerRef, getOptions, data, fillParent: height === 'fill' })
  useEffect(() => { chartRef.current?.redraw() }, [chartRef, formatters])

  return null
}
