import type uPlot from 'uplot'
import type { Threshold } from '../types'

/**
 * uPlot plugin that draws horizontal threshold lines on the plot area.
 * Lines are drawn after axes/series so they sit on top.
 */
export function thresholdPlugin(
  thresholds: Threshold[],
  yScale = 'y',
): uPlot.Plugin {
  if (!thresholds.length) return { hooks: {} }

  return {
    hooks: {
      draw: [(u: uPlot) => {
        const ctx = u.ctx
        const { left, top, width, height } = u.bbox
        const dpr = devicePixelRatio

        ctx.save()
        ctx.beginPath()
        ctx.rect(left, top, width, height)
        ctx.clip()

        for (const t of thresholds) {
          const y = u.valToPos(t.value, yScale, true)
          if (y < top || y > top + height) continue

          ctx.beginPath()
          ctx.moveTo(left, y)
          ctx.lineTo(left + width, y)
          ctx.strokeStyle = t.color
          ctx.lineWidth   = (t.width ?? 1) * dpr
          ctx.setLineDash((t.dash ?? []).map(d => d * dpr))
          ctx.stroke()

          if (t.label) {
            ctx.font         = `${11 * dpr}px system-ui, sans-serif`
            ctx.fillStyle    = t.color
            ctx.textBaseline = 'bottom'
            ctx.textAlign    = 'right'
            ctx.globalAlpha  = 0.9
            ctx.fillText(t.label, left + width - 4 * dpr, y - 2 * dpr)
            ctx.globalAlpha  = 1
          }
        }

        ctx.restore()
      }],
    },
  }
}
