import type uPlot from 'uplot'
import type { BarSeriesConfig } from '../types'

/**
 * uPlot draw-hook plugin that renders grouped or stacked bar charts.
 *
 * Vertical orientation:
 *   uPlot x = category indices,  y = values
 *   Draws vertical rectangles from y=0 up to y=value
 *
 * Horizontal orientation:
 *   uPlot x = category indices,  y = values  (same data layout)
 *   Draws horizontal rectangles — categories on the y-axis, values on the x-axis
 *   The BarCanvas sets up the axes accordingly when orientation='horizontal'
 */
export function barPlugin(
  series:      BarSeriesConfig[],
  orientation: 'vertical' | 'horizontal',
  stacked:     boolean,
): uPlot.Plugin {
  return {
    hooks: {
      draw: [(u: uPlot) => {
        const ctx    = u.ctx
        const { left, top, width, height } = u.bbox
        const n      = series[0]?.values.length ?? 0
        const nS     = series.length
        if (n === 0 || nS === 0) return

        ctx.save()
        ctx.beginPath()
        ctx.rect(left, top, width, height)
        ctx.clip()

        if (orientation === 'vertical') {
          // slot width in canvas px (range is [-0.5, n-0.5] → n slots of width/n each)
          const slotW    = width / n
          const totalBarW = slotW * 0.8
          const barW      = stacked ? totalBarW : totalBarW / nS
          const y0        = u.valToPos(0, 'y', true)

          if (stacked) {
            const bases = new Array(n).fill(0)
            for (const s of series) {
              for (let ci = 0; ci < n; ci++) {
                const v = s.values[ci]
                if (v == null) continue
                const cx  = u.valToPos(ci, 'x', true)
                const yB  = u.valToPos(bases[ci], 'y', true)
                const yT  = u.valToPos(bases[ci] + v, 'y', true)
                ctx.fillStyle = s.color
                ctx.globalAlpha = 0.85
                ctx.fillRect(cx - totalBarW / 2, Math.min(yB, yT), totalBarW, Math.abs(yT - yB))
                bases[ci] += v
              }
            }
          } else {
            for (let si = 0; si < nS; si++) {
              const s      = series[si]
              const offset = (si - (nS - 1) / 2) * barW
              for (let ci = 0; ci < n; ci++) {
                const v = s.values[ci]
                if (v == null) continue
                const cx = u.valToPos(ci, 'x', true)
                const yT = u.valToPos(v, 'y', true)
                ctx.fillStyle   = s.color
                ctx.globalAlpha = 0.85
                ctx.fillRect(cx + offset - barW / 2, Math.min(y0, yT), barW, Math.abs(y0 - yT))
              }
            }
          }
        } else {
          // Horizontal — categories on y-axis (indices), values on x-axis
          const slotH     = height / n
          const totalBarH = slotH * 0.8
          const barH      = stacked ? totalBarH : totalBarH / nS
          const x0        = u.valToPos(0, 'x', true)

          if (stacked) {
            const bases = new Array(n).fill(0)
            for (const s of series) {
              for (let ci = 0; ci < n; ci++) {
                const v = s.values[ci]
                if (v == null) continue
                const cy  = u.valToPos(ci, 'y', true)
                const xL  = u.valToPos(bases[ci], 'x', true)
                const xR  = u.valToPos(bases[ci] + v, 'x', true)
                ctx.fillStyle   = s.color
                ctx.globalAlpha = 0.85
                ctx.fillRect(Math.min(xL, xR), cy - totalBarH / 2, Math.abs(xR - xL), totalBarH)
                bases[ci] += v
              }
            }
          } else {
            for (let si = 0; si < nS; si++) {
              const s      = series[si]
              const offset = (si - (nS - 1) / 2) * barH
              for (let ci = 0; ci < n; ci++) {
                const v = s.values[ci]
                if (v == null) continue
                const cy = u.valToPos(ci, 'y', true)
                const xR = u.valToPos(v, 'x', true)
                ctx.fillStyle   = s.color
                ctx.globalAlpha = 0.85
                ctx.fillRect(Math.min(x0, xR), cy + offset - barH / 2, Math.abs(xR - x0), barH)
              }
            }
          }
        }

        ctx.globalAlpha = 1
        ctx.restore()
      }],
    },
  }
}
