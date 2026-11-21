import type uPlot from 'uplot'
import type { ChartDatumEvent } from '../../core'

export function resolveHistogramDatumEvent(
  chart: uPlot,
  event: MouseEvent,
  id: string,
  edges: readonly number[],
  counts: readonly number[],
): ChartDatumEvent<number> | null {
  const rect = chart.over.getBoundingClientRect()
  const localX = event.clientX - rect.left
  const localY = event.clientY - rect.top
  const datumIndex = chart.posToIdx(localX)
  const x = edges[datumIndex]
  const y = counts[datumIndex]
  if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return null
  if (localY < Math.min(chart.valToPos(0, 'y'), chart.valToPos(y, 'y')) || localY > Math.max(chart.valToPos(0, 'y'), chart.valToPos(y, 'y'))) return null
  return { seriesId: id, datumIndex, x, y, clientX: event.clientX, clientY: event.clientY }
}
