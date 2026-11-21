import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type uPlot from 'uplot'
import type { AlignedData, SeriesConfig } from '../types'
import { filterHiddenSeriesIds, updateHiddenSeriesIds } from '../utils/visibility'

export interface SeriesStats {
  min:  number | null
  max:  number | null
  avg:  number | null
  last: number | null
}

export interface LegendItem {
  id?:     string
  index:   number         // series index in uPlot (1-based; 0 = timestamps)
  label:   string
  color:   string
  unit?:   string
  visible: boolean
  value:   number | null  // value at current cursor position
  stats:   SeriesStats
}

function computeStats(values: readonly (number | null | undefined)[]): SeriesStats {
  const valid = values.filter((v): v is number => v != null)
  if (valid.length === 0) return { min: null, max: null, avg: null, last: null }
  return {
    min:  Math.min(...valid),
    max:  Math.max(...valid),
    avg:  valid.reduce((a, b) => a + b, 0) / valid.length,
    last: [...values].reverse().find((v): v is number => v != null) ?? null,
  }
}

/**
 * Manages per-series visibility toggles and cursor values shown in the legend.
 * Stats (min/max/avg/last) are computed from data and memoised.
 */
interface LegendStateOptions {
  hiddenSeriesIds?: readonly string[]
  onHiddenSeriesIdsChange?: (ids: string[]) => void
}

export function useLegendState(
  series: SeriesConfig[],
  data: AlignedData,
  { hiddenSeriesIds, onHiddenSeriesIdsChange }: LegendStateOptions = {},
) {
  const uRef = useRef<uPlot | null>(null)
  const toChartSeriesIndexRef = useRef((index: number) => index)

  // Stats recomputed when data or series count changes
  const stats = useMemo(
    () => series.map((_, i) => computeStats((data[i + 1] ?? []) as (number | null)[])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, series.length],
  )

  const [internalHiddenIds, setInternalHiddenIds] = useState<string[]>([])
  const [hiddenIndexes, setHiddenIndexes] = useState<Set<number>>(() => new Set())
  const [values, setValues] = useState<(number | null)[]>(() => series.map(() => null))

  const isControlled = hiddenSeriesIds !== undefined
  const resolvedHiddenIds = filterHiddenSeriesIds(
    series,
    isControlled ? hiddenSeriesIds : internalHiddenIds,
  )
  const hiddenIdSet = new Set(resolvedHiddenIds)
  const visibility = series.map((item, index) =>
    item.id ? !hiddenIdSet.has(item.id) : !hiddenIndexes.has(index),
  )

  const seriesRef = useRef(series)
  const visibilityRef = useRef(visibility)
  const hiddenIdsRef = useRef(resolvedHiddenIds)
  const controlledRef = useRef(isControlled)
  const onHiddenChangeRef = useRef(onHiddenSeriesIdsChange)
  seriesRef.current = series
  visibilityRef.current = visibility
  hiddenIdsRef.current = resolvedHiddenIds
  controlledRef.current = isControlled
  onHiddenChangeRef.current = onHiddenSeriesIdsChange

  // Items are fully derived — no redundant state
  const items: LegendItem[] = series.map((s, i) => ({
    id:      s.id,
    index:   i + 1,
    label:   s.label,
    color:   s.color,
    unit:    s.unit,
    visible: visibility[i] ?? true,
    value:   values[i] ?? null,
    stats:   stats[i] ?? { min: null, max: null, avg: null, last: null },
  }))

  const setChart = useCallback((chart: uPlot, toChartSeriesIndex = (index: number) => index) => {
    uRef.current = chart
    toChartSeriesIndexRef.current = toChartSeriesIndex
    visibilityRef.current.forEach((visible, index) => {
      chart.setSeries(toChartSeriesIndex(index + 1), { show: visible })
    })
  }, [])

  const setSeriesVisibility = useCallback((index: number, visible: boolean) => {
    const item = seriesRef.current[index - 1]
    if (!item) return

    if (item.id) {
      const next = updateHiddenSeriesIds(hiddenIdsRef.current, item.id, visible)
      if (next.length === hiddenIdsRef.current.length && next.every((id, i) => id === hiddenIdsRef.current[i])) return
      hiddenIdsRef.current = next
      if (!controlledRef.current) setInternalHiddenIds(next)
      onHiddenChangeRef.current?.(next)
      return
    }

    setHiddenIndexes((previous) => {
      const itemIndex = index - 1
      const isVisible = !previous.has(itemIndex)
      if (isVisible === visible) return previous
      const next = new Set(previous)
      if (visible) next.delete(itemIndex)
      else next.add(itemIndex)
      return next
    })
  }, [])

  const toggle = useCallback((index: number) => {
    const visible = visibilityRef.current[index - 1] ?? true
    if (uRef.current) uRef.current.setSeries(toChartSeriesIndexRef.current(index), { show: !visible })
    else setSeriesVisibility(index, !visible)
  }, [setSeriesVisibility])

  useEffect(() => {
    const chart = uRef.current
    if (!chart) return
    visibility.forEach((visible, index) => {
      const chartIndex = toChartSeriesIndexRef.current(index + 1)
      if (chart.series[chartIndex]?.show !== visible) {
        chart.setSeries(chartIndex, { show: visible })
      }
    })
  }, [visibility])

  /** Call from uPlot's setCursor hook to refresh displayed values */
  const updateValues = useCallback((chart: uPlot, dataIdx: number | null) => {
    setValues(
      series.map((_, i) => {
        if (dataIdx == null) return null
        const v = data[i + 1]?.[dataIdx]
        return v != null ? v : null
      }),
    )
  }, [data, series])

  return { items, setChart, setSeriesVisibility, toggle, updateValues }
}
