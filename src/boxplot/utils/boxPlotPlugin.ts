import type uPlot from 'uplot'
import { hexToRgba } from '../../core'
import type { BoxSeriesConfig } from '../types'

/**
 * uPlot plugin that draws box plots using canvas draw hooks.
 *
 * X axis uses category indices (0, 1, 2, …).
 * When multiple series exist they are spread horizontally within each category slot.
 */
export function boxPlotPlugin(series: BoxSeriesConfig[]): uPlot.Plugin {
  return {
    hooks: {
      draw: (u: uPlot) => {
        if (!series.length) return

        const ctx = u.ctx
        ctx.save()
        ctx.beginPath()
        ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height)
        ctx.clip()

        const nSeries  = series.length
        // Column width in canvas px between adjacent categories
        const colW     = series[0].data.length > 1
          ? Math.abs(u.valToPos(1, 'x', true) - u.valToPos(0, 'x', true))
          : u.bbox.width / Math.max(1, series[0].data.length)

        const boxHalfW  = (colW / nSeries) * 0.35
        const seriesGap = colW / nSeries

        series.forEach((s, si) => {
          const offset = (si - (nSeries - 1) / 2) * seriesGap

          s.data.forEach((stats, xi) => {
            const cx   = u.valToPos(xi, 'x', true) + offset
            const yMin = u.valToPos(stats.min,    'y', true)
            const yQ1  = u.valToPos(stats.q1,     'y', true)
            const yMed = u.valToPos(stats.median, 'y', true)
            const yQ3  = u.valToPos(stats.q3,     'y', true)
            const yMax = u.valToPos(stats.max,    'y', true)

            // ── Box (IQR) ────────────────────────────────────────────────────
            ctx.fillStyle   = hexToRgba(s.color, 0.18)
            ctx.strokeStyle = s.color
            ctx.lineWidth   = 1.5
            ctx.beginPath()
            ctx.rect(cx - boxHalfW, yQ3, boxHalfW * 2, yQ1 - yQ3)
            ctx.fill()
            ctx.stroke()

            // ── Median line ──────────────────────────────────────────────────
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.moveTo(cx - boxHalfW, yMed)
            ctx.lineTo(cx + boxHalfW, yMed)
            ctx.stroke()

            // ── Whiskers & caps ──────────────────────────────────────────────
            ctx.lineWidth = 1
            const capHalf = boxHalfW * 0.45

            // lower whisker: q1 → min
            ctx.beginPath()
            ctx.moveTo(cx, yQ1)
            ctx.lineTo(cx, yMin)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(cx - capHalf, yMin)
            ctx.lineTo(cx + capHalf, yMin)
            ctx.stroke()

            // upper whisker: q3 → max
            ctx.beginPath()
            ctx.moveTo(cx, yQ3)
            ctx.lineTo(cx, yMax)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(cx - capHalf, yMax)
            ctx.lineTo(cx + capHalf, yMax)
            ctx.stroke()

            // ── Outliers ─────────────────────────────────────────────────────
            if (stats.outliers?.length) {
              ctx.fillStyle = s.color
              for (const o of stats.outliers) {
                const yo = u.valToPos(o, 'y', true)
                ctx.beginPath()
                ctx.arc(cx, yo, 2.5, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          })
        })

        ctx.restore()
      },
    },
  }
}
