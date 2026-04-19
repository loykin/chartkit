import uPlot from 'uplot'
import type { LineStyle } from '../types'

/**
 * Plugin that draws the axis border lines (left + bottom frame) in the
 * `draw` hook — fires AFTER all axes/series — so they are never buried
 * under grid lines or fill areas.
 *
 * Completely independent from gridStyle: each has its own defaults.
 */
export function makeAxisBorderPlugin(
  style:         LineStyle | false | undefined,
  defaultStroke: string,
  defaultWidth:  number,
): uPlot.Plugin {
  if (style === false) return { hooks: {} }

  const stroke = style?.stroke ?? defaultStroke
  const width  = style?.width  ?? defaultWidth
  const dash   = style?.dash

  return {
    hooks: {
      draw: [(u: uPlot) => {
        const { ctx, bbox } = u
        const dpr    = devicePixelRatio
        const lw     = Math.round(width * dpr * 2) / 2   // snap to 0.5-px grid
        const offset = (lw % 2) / 2

        ctx.save()
        ctx.strokeStyle = stroke
        ctx.lineWidth   = lw
        ctx.setLineDash(dash ? dash.map(d => d * dpr) : [])
        ctx.lineCap = 'square'
        ctx.translate(offset, offset)

        ctx.beginPath()
        // left vertical line (y-axis border)
        ctx.moveTo(bbox.left, bbox.top)
        ctx.lineTo(bbox.left, bbox.top + bbox.height)
        // bottom horizontal line (x-axis border)
        ctx.moveTo(bbox.left,              bbox.top + bbox.height)
        ctx.lineTo(bbox.left + bbox.width, bbox.top + bbox.height)
        ctx.stroke()

        ctx.restore()
      }],
    },
  }
}
