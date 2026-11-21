import type uPlot from 'uplot'
import type { ChartDatumEvent } from '../../core'
import type { AlignedData, SeriesConfig } from '../types'

interface DatumEventPluginOptions {
  data: AlignedData
  series: readonly SeriesConfig[]
  toInputSeriesIndex: (chartSeriesIndex: number) => number
  onClick?: (event: ChartDatumEvent<number>) => void
  onHover?: (event: ChartDatumEvent<number> | null) => void
}

export function resolveDatumEvent(
  chart: uPlot,
  event: MouseEvent,
  options: Pick<DatumEventPluginOptions, 'data' | 'series' | 'toInputSeriesIndex'>,
): ChartDatumEvent<number> | null {
  const rect = chart.over.getBoundingClientRect()
  const datumIndex = chart.posToIdx(event.clientX - rect.left)
  if (datumIndex < 0 || datumIndex >= (options.data[0]?.length ?? 0)) return null

  const pointerY = event.clientY - rect.top
  let nearestChartIndex = -1
  let nearestDistance = Number.POSITIVE_INFINITY

  for (let chartIndex = 1; chartIndex < chart.series.length; chartIndex++) {
    if (chart.series[chartIndex]?.show === false) continue
    const value = chart.data[chartIndex]?.[datumIndex]
    const scale = chart.series[chartIndex]?.scale
    if (typeof value !== 'number' || !Number.isFinite(value) || !scale) continue
    const distance = Math.abs(chart.valToPos(value, scale) - pointerY)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestChartIndex = chartIndex
    }
  }

  if (nearestChartIndex < 1) return null
  const inputIndex = options.toInputSeriesIndex(nearestChartIndex)
  const inputSeries = options.series[inputIndex]
  const x = options.data[0]?.[datumIndex]
  const y = options.data[inputIndex + 1]?.[datumIndex]
  if (!inputSeries || typeof x !== 'number') return null

  return {
    seriesId: inputSeries.id ?? String(inputIndex),
    datumIndex,
    x,
    y: typeof y === 'number' && Number.isFinite(y) ? y : null,
    clientX: event.clientX,
    clientY: event.clientY,
  }
}

export function datumEventPlugin(options: DatumEventPluginOptions): uPlot.Plugin {
  let click: ((event: MouseEvent) => void) | undefined
  let move: ((event: MouseEvent) => void) | undefined
  let leave: (() => void) | undefined

  return {
    hooks: {
      ready: [(chart) => {
        click = options.onClick
          ? event => {
              const payload = resolveDatumEvent(chart, event, options)
              if (payload) options.onClick?.(payload)
            }
          : undefined
        move = options.onHover
          ? event => options.onHover?.(resolveDatumEvent(chart, event, options))
          : undefined
        leave = options.onHover ? () => options.onHover?.(null) : undefined
        if (click) chart.over.addEventListener('click', click)
        if (move) chart.over.addEventListener('mousemove', move)
        if (leave) chart.over.addEventListener('mouseleave', leave)
      }],
      destroy: [(chart) => {
        if (click) chart.over.removeEventListener('click', click)
        if (move) chart.over.removeEventListener('mousemove', move)
        if (leave) chart.over.removeEventListener('mouseleave', leave)
      }],
    },
  }
}
