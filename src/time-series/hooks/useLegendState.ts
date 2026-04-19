import { useCallback, useMemo, useRef, useState } from 'react'
import type uPlot from 'uplot'
import type { AlignedData, SeriesConfig } from '../types'

export interface SeriesStats {
  min:  number | null
  max:  number | null
  avg:  number | null
  last: number | null
}

export interface LegendItem {
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
export function useLegendState(series: SeriesConfig[], data: AlignedData) {
  const uRef = useRef<uPlot | null>(null)

  // Stats recomputed when data or series count changes
  const stats = useMemo(
    () => series.map((_, i) => computeStats((data[i + 1] ?? []) as (number | null)[])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, series.length],
  )

  const [visibility, setVisibility] = useState<boolean[]>(() => series.map(() => true))
  const [values,     setValues    ] = useState<(number | null)[]>(() => series.map(() => null))

  // Items are fully derived — no redundant state
  const items: LegendItem[] = series.map((s, i) => ({
    index:   i + 1,
    label:   s.label,
    color:   s.color,
    unit:    s.unit,
    visible: visibility[i] ?? true,
    value:   values[i] ?? null,
    stats:   stats[i] ?? { min: null, max: null, avg: null, last: null },
  }))

  const setChart = useCallback((chart: uPlot) => {
    uRef.current = chart
  }, [])

  const toggle = useCallback((index: number) => {
    setVisibility((prev) => {
      const next = [...prev]
      next[index - 1] = !(next[index - 1] ?? true)
      uRef.current?.setSeries(index, { show: next[index - 1] })
      return next
    })
  }, [])

  /** Call from uPlot's setCursor hook to refresh displayed values */
  const updateValues = useCallback((chart: uPlot, dataIdx: number | null) => {
    setValues(
      series.map((_, i) => {
        if (dataIdx == null) return null
        const v = chart.data[i + 1]?.[dataIdx]
        return v != null ? v : null
      }),
    )
  }, [series])

  return { items, setChart, toggle, updateValues }
}
