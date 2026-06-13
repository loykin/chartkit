import { useCallback, useMemo, useRef } from 'react'
import uPlot from 'uplot'
import { useChart, hexToRgba, makeAxisBorderPlugin, resolveAxisStyles, CHART_DEFAULT_LINE_WIDTH, formatNum } from '../../core'
import type { AxisConfig, LineStyle } from '../../core'

interface HistogramCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Left edges of each bin */
  edges:        number[]
  /** Count or percentage (0–100) per bin */
  counts:       number[]
  height:       number
  color:        string
  fillOpacity:  number
  /** When true, y-axis shows "%" suffix */
  normalize:    boolean
  xUnit?:       string
  yUnit?:       string
  yMin?:        number
  yMax?:        number
  gridStyle?:   LineStyle | false
  axisStyle?:   AxisConfig | false
}

export function HistogramCanvas({
  containerRef,
  edges,
  counts,
  height,
  color,
  fillOpacity,
  normalize,
  xUnit,
  yUnit,
  yMin,
  yMax,
  gridStyle,
  axisStyle,
}: HistogramCanvasProps) {
  // Use refs for formatter-only values so they don't trigger chart recreation.
  // normalize/xUnit/yUnit only affect tick labels — setData + redraw is enough.
  const normalizeRef = useRef(normalize)
  normalizeRef.current = normalize
  const xUnitRef = useRef(xUnit)
  xUnitRef.current = xUnit
  const yUnitRef = useRef(yUnit)
  yUnitRef.current = yUnit

  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    // Closures capture refs so label format updates on next redraw (setData)
    // without needing to recreate the entire chart.
    const xAxisValues: uPlot.Axis['values'] = (_u, vals) =>
      vals.map(v => {
        if (v == null) return ''
        const n = formatNum(v)
        return xUnitRef.current ? `${n}\u202f${xUnitRef.current}` : n
      })

    const yAxisValues: uPlot.Axis['values'] = (_u, vals) =>
      vals.map(v => {
        if (v == null) return ''
        if (normalizeRef.current) return `${formatNum(v)}%`
        const n = formatNum(v)
        return yUnitRef.current ? `${n}\u202f${yUnitRef.current}` : n
      })

    return {
      width:     300,
      height,
      drawOrder: ['axes', 'series'] as uPlot.DrawOrderKey[],
      legend:    { show: false },
      cursor:    { drag: { x: false, y: false } },
      scales: {
        x: { time: false },
        y: { range: [yMin ?? 0, yMax ?? null] as [number, number | null] },
      },
      series: [
        {},
        {
          scale:  'y',
          stroke: color,
          fill:   hexToRgba(color, fillOpacity),
          width:  0,
          points: { show: false },
          paths:  uPlot.paths.bars?.({ size: [1, Infinity], align: 1 }),
        },
      ],
      axes: [
        {
          space:  60,
          size:   40,
          stroke: mutedFgColor,
          values: xAxisValues,
          ticks:  resolvedTicks,
          grid:   resolvedGrid,
        },
        {
          size:      54,
          labelSize: 16,
          stroke:    mutedFgColor,
          values:    yAxisValues,
          ticks:     resolvedTicks,
          grid:      resolvedGrid,
        },
      ],
      plugins: [
        makeAxisBorderPlugin(axisLineStyle, axisColor, CHART_DEFAULT_LINE_WIDTH),
      ],
    }
  // normalize / xUnit / yUnit intentionally omitted — handled via refs above
  }, [height, color, fillOpacity, yMin, yMax, gridStyle, axisStyle])

  const data = useMemo<uPlot.AlignedData>(
    () => [edges, counts],
    [edges, counts],
  )

  useChart({ containerRef, getOptions, data })

  return null
}
