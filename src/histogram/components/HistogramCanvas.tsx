import { useCallback, useEffect, useMemo, useRef } from 'react'
import uPlot from 'uplot'
import { useChart, hexToRgba, makeAxisBorderPlugin, pointerEventPlugin, resolveAxisStyles, CHART_DEFAULT_LINE_WIDTH, formatNum } from '../../core'
import type { AxisConfig, ChartDatumEvent, ChartFormatters, LineStyle } from '../../core'
import { resolveHistogramDatumEvent } from '../utils/datumEvent'

interface HistogramCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Left edges of each bin */
  edges:        number[]
  /** Count or percentage (0–100) per bin */
  counts:       number[]
  height:       number | 'fill'
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
  formatters:   ChartFormatters
  id:           string
  onDatumClick?: (event: ChartDatumEvent<number>) => void
  onDatumHover?: (event: ChartDatumEvent<number> | null) => void
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
  formatters,
  id,
  onDatumClick,
  onDatumHover,
}: HistogramCanvasProps) {
  // Use refs for formatter-only values so they don't trigger chart recreation.
  // normalize/xUnit/yUnit only affect tick labels — setData + redraw is enough.
  const normalizeRef = useRef(normalize)
  normalizeRef.current = normalize
  const xUnitRef = useRef(xUnit)
  xUnitRef.current = xUnit
  const yUnitRef = useRef(yUnit)
  yUnitRef.current = yUnit
  const formattersRef = useRef(formatters)
  formattersRef.current = formatters
  const onDatumClickRef = useRef(onDatumClick)
  const onDatumHoverRef = useRef(onDatumHover)
  const idRef = useRef(id)
  const edgesRef = useRef(edges)
  const countsRef = useRef(counts)
  onDatumClickRef.current = onDatumClick
  onDatumHoverRef.current = onDatumHover
  idRef.current = id
  edgesRef.current = edges
  countsRef.current = counts
  const hasDatumEvents = onDatumClick !== undefined || onDatumHover !== undefined

  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    // Closures capture refs so label format updates on next redraw (setData)
    // without needing to recreate the entire chart.
    const xAxisValues: uPlot.Axis['values'] = (_u, vals) =>
      vals.map(v => {
        if (v == null) return ''
        if (formattersRef.current.value) {
          return formattersRef.current.value(v, {
            chartType: 'histogram', purpose: 'axis', axis: 'x', unit: xUnitRef.current,
          })
        }
        const n = formatNum(v)
        return xUnitRef.current ? `${n}\u202f${xUnitRef.current}` : n
      })

    const yAxisValues: uPlot.Axis['values'] = (_u, vals) =>
      vals.map(v => {
        if (v == null) return ''
        if (normalizeRef.current) {
          return formattersRef.current.percentage?.(v, {
            chartType: 'histogram', purpose: 'axis', axis: 'y', unit: '%',
          }) ?? `${formatNum(v)}%`
        }
        if (formattersRef.current.value) {
          return formattersRef.current.value(v, {
            chartType: 'histogram', purpose: 'axis', axis: 'y', unit: yUnitRef.current,
          })
        }
        const n = formatNum(v)
        return yUnitRef.current ? `${n}\u202f${yUnitRef.current}` : n
      })

    return {
      width:     300,
      height:    height === 'fill' ? 300 : height,
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
        ...(hasDatumEvents ? [pointerEventPlugin({
          resolve: (chart, event) => resolveHistogramDatumEvent(chart, event, idRef.current, edgesRef.current, countsRef.current),
          onClick: event => onDatumClickRef.current?.(event),
          onHover: event => onDatumHoverRef.current?.(event),
        })] : []),
      ],
    }
  // normalize / xUnit / yUnit intentionally omitted — handled via refs above
  }, [height, color, fillOpacity, yMin, yMax, gridStyle, axisStyle, hasDatumEvents])

  const data = useMemo<uPlot.AlignedData>(
    () => [edges, counts],
    [edges, counts],
  )

  const chartRef = useChart({ containerRef, getOptions, data, fillParent: height === 'fill' })
  useEffect(() => { chartRef.current?.redraw() }, [chartRef, formatters])

  return null
}
