import type uPlot from 'uplot'
import type { ChartDatumEvent } from '../types'

interface PointerEventPluginOptions<X> {
  resolve: (chart: uPlot, event: MouseEvent) => ChartDatumEvent<X> | null
  onClick?: (event: ChartDatumEvent<X>) => void
  onHover?: (event: ChartDatumEvent<X> | null) => void
}

export function pointerEventPlugin<X>(options: PointerEventPluginOptions<X>): uPlot.Plugin {
  let click: ((event: MouseEvent) => void) | undefined
  let move: ((event: MouseEvent) => void) | undefined
  let leave: (() => void) | undefined

  return {
    hooks: {
      ready: [(chart) => {
        click = options.onClick
          ? event => {
              const payload = options.resolve(chart, event)
              if (payload) options.onClick?.(payload)
            }
          : undefined
        move = options.onHover
          ? event => options.onHover?.(options.resolve(chart, event))
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
