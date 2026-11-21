import type uPlot from 'uplot'
import type { ChartDatumEvent } from '../../core'
import type { BarSeriesConfig } from '../types'

const contains = (value: number, a: number, b: number) => value >= Math.min(a, b) && value <= Math.max(a, b)

export function resolveBarDatumEvent(
  chart: uPlot,
  event: MouseEvent,
  categories: readonly string[],
  series: readonly BarSeriesConfig[],
  orientation: 'vertical' | 'horizontal',
  stacked: boolean,
): ChartDatumEvent<string> | null {
  if (!categories.length || !series.length) return null
  const rect = chart.over.getBoundingClientRect()
  const pointerX = event.clientX - rect.left
  const pointerY = event.clientY - rect.top
  const nSeries = series.length
  const slotSize = (orientation === 'vertical' ? rect.width : rect.height) / categories.length
  const totalSize = slotSize * 0.8
  const itemSize = stacked ? totalSize : totalSize / nSeries

  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    let base = 0
    for (let seriesIndex = 0; seriesIndex < nSeries; seriesIndex++) {
      const item = series[seriesIndex]
      const value = item.values[categoryIndex]
      if (value == null || !Number.isFinite(value)) continue
      const offset = stacked ? 0 : (seriesIndex - (nSeries - 1) / 2) * itemSize
      const start = stacked ? base : 0
      const end = start + value
      const categoryCenter = chart.valToPos(categoryIndex, orientation === 'vertical' ? 'x' : 'y') + offset
      const valueStart = chart.valToPos(start, orientation === 'vertical' ? 'y' : 'x')
      const valueEnd = chart.valToPos(end, orientation === 'vertical' ? 'y' : 'x')
      const hit = orientation === 'vertical'
        ? contains(pointerX, categoryCenter - itemSize / 2, categoryCenter + itemSize / 2) && contains(pointerY, valueStart, valueEnd)
        : contains(pointerY, categoryCenter - itemSize / 2, categoryCenter + itemSize / 2) && contains(pointerX, valueStart, valueEnd)
      if (hit) {
        return {
          seriesId: item.id ?? String(seriesIndex), datumIndex: categoryIndex,
          x: categories[categoryIndex], y: value,
          clientX: event.clientX, clientY: event.clientY,
        }
      }
      if (stacked) base = end
    }
  }

  return null
}
