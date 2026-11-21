import type uPlot from 'uplot'
import type { ChartDatumEvent } from '../../core'
import type { ScatterSeriesConfig } from '../types'

export function resolveScatterDatumEvent(
  chart: uPlot,
  event: MouseEvent,
  series: readonly ScatterSeriesConfig[],
): ChartDatumEvent<number> | null {
  const rect = chart.over.getBoundingClientRect()
  const pointerX = event.clientX - rect.left
  const pointerY = event.clientY - rect.top
  let result: ChartDatumEvent<number> | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  series.forEach((item, seriesIndex) => {
    if (chart.series[seriesIndex + 1]?.show === false) return
    const hitRadius = Math.max(6, (item.pointSize ?? 4) / 2 + 3)
    const length = Math.min(item.xs.length, item.ys.length)
    for (let datumIndex = 0; datumIndex < length; datumIndex++) {
      const x = item.xs[datumIndex]
      const y = item.ys[datumIndex]
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      const distance = Math.hypot(chart.valToPos(x, 'x') - pointerX, chart.valToPos(y, 'y') - pointerY)
      if (distance <= hitRadius && distance < nearestDistance) {
        nearestDistance = distance
        result = {
          seriesId: item.id ?? String(seriesIndex), datumIndex, x, y,
          clientX: event.clientX, clientY: event.clientY,
        }
      }
    }
  })

  return result
}
