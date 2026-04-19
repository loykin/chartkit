import { useCallback, useMemo } from 'react'
import uPlot from 'uplot'
import { useChart, resolveAxisStyles, makeAxisBorderPlugin, CHART_DEFAULT_LINE_WIDTH, makeAxisValues } from '../../core'
import type { AxisConfig, LineStyle } from '../../core'
import { boxPlotPlugin } from '../utils/boxPlotPlugin'
import type { BoxSeriesConfig } from '../types'

interface BoxPlotCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  categories:   string[]
  series:       BoxSeriesConfig[]
  height:       number
  yUnit?:       string
  gridStyle?:   LineStyle | false
  axisStyle?:   AxisConfig | false
}

export function BoxPlotCanvas({
  containerRef,
  categories,
  series,
  height,
  yUnit,
  gridStyle,
  axisStyle,
}: BoxPlotCanvasProps) {
  // Compute y range from all stats so uPlot scales correctly
  const [yMin, yMax] = useMemo(() => {
    let lo = Infinity, hi = -Infinity
    for (const s of series) {
      for (const d of s.data) {
        if (d.min < lo) lo = d.min
        if (d.max > hi) hi = d.max
        for (const o of d.outliers ?? []) {
          if (o < lo) lo = o
          if (o > hi) hi = o
        }
      }
    }
    if (!isFinite(lo)) return [0, 1]
    const pad = (hi - lo) * 0.08
    return [lo - pad, hi + pad]
  }, [series])

  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, borderColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    const n = categories.length

    return {
      width:     300,
      height,
      legend:    { show: false },
      cursor:    { drag: { x: false, y: false }, points: { show: false } },
      scales: {
        x: {
          time:  false,
          auto:  false,
          range: [-0.5, n - 0.5] as [number, number],
        },
        y: {
          range: [yMin, yMax] as [number, number],
        },
      },
      axes: [
        {
          space:  40,
          size:   40,
          stroke: mutedFgColor,
          ticks:  { ...resolvedTicks, show: false },
          grid:   { show: false },
          // Show only integer ticks that correspond to category indices
          splits: () => categories.map((_, i) => i),
          values: (_u, ticks) => ticks.map(t => categories[Math.round(t)] ?? ''),
        },
        {
          size:   54,
          stroke: mutedFgColor,
          ticks:  resolvedTicks,
          grid:   resolvedGrid,
          values: makeAxisValues(yUnit),
        },
      ],
      series: [
        {},
        // One dummy series so uPlot initializes properly; rendering via plugin
        { paths: () => null, points: { show: false } },
      ],
      plugins: [
        boxPlotPlugin(series),
        makeAxisBorderPlugin(axisLineStyle, borderColor, CHART_DEFAULT_LINE_WIDTH),
      ],
    }
  }, [categories, series, height, yUnit, yMin, yMax, gridStyle, axisStyle])

  // Dummy data: x indices + a single y series (values unused — plugin draws everything)
  const data = useMemo<uPlot.AlignedData>(() => {
    const xs = categories.map((_, i) => i)
    return [xs, xs.map(() => 0)]
  }, [categories])

  useChart({ containerRef, getOptions, data })

  return null
}
