import type uPlot from 'uplot'
import { hexToRgba } from '../../core'
import type { CandlestickDataPoint } from '../types'

interface CandlestickPluginOptions {
  data: CandlestickDataPoint[]
  upColor: string
  downColor: string
  candleWidth: number
  showVolume: boolean
  volumeHeight: number
}

export function candlestickPlugin({
  data,
  upColor,
  downColor,
  candleWidth,
  showVolume,
  volumeHeight,
}: CandlestickPluginOptions): uPlot.Plugin {
  return {
    hooks: {
      draw: (u: uPlot) => {
        if (!data.length) return

        const ctx = u.ctx
        const ratio = devicePixelRatio
        const xMin = u.scales.x.min ?? -Infinity
        const xMax = u.scales.x.max ?? Infinity
        const visible = data.filter(candle => candle.time >= xMin && candle.time <= xMax)
        if (!visible.length) return

        const fallbackSpacing = u.bbox.width / Math.max(1, visible.length)
        let spacing = fallbackSpacing
        if (visible.length > 1) {
          spacing = Infinity
          for (let i = 1; i < visible.length; i++) {
            const current = u.valToPos(visible[i].time, 'x', true)
            const previous = u.valToPos(visible[i - 1].time, 'x', true)
            spacing = Math.min(spacing, Math.abs(current - previous))
          }
        }
        const bodyWidth = Math.max(ratio, Math.min(32 * ratio, spacing * candleWidth))

        ctx.save()
        ctx.beginPath()
        ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height)
        ctx.clip()

        if (showVolume) {
          const maxVolume = Math.max(...visible.map(candle => candle.volume ?? 0))
          const volumeBottom = u.bbox.top + u.bbox.height
          const volumePixels = u.bbox.height * volumeHeight

          if (maxVolume > 0) {
            for (const candle of visible) {
              const volume = candle.volume ?? 0
              if (volume <= 0) continue
              const x = u.valToPos(candle.time, 'x', true)
              const height = (volume / maxVolume) * volumePixels
              const color = candle.close >= candle.open ? upColor : downColor
              ctx.fillStyle = hexToRgba(color, 0.22)
              ctx.fillRect(x - bodyWidth / 2, volumeBottom - height, bodyWidth, height)
            }
          }
        }

        for (const candle of visible) {
          const x = u.valToPos(candle.time, 'x', true)
          const openY = u.valToPos(candle.open, 'y', true)
          const highY = u.valToPos(candle.high, 'y', true)
          const lowY = u.valToPos(candle.low, 'y', true)
          const closeY = u.valToPos(candle.close, 'y', true)
          const color = candle.close >= candle.open ? upColor : downColor

          ctx.strokeStyle = color
          ctx.lineWidth = ratio
          ctx.beginPath()
          ctx.moveTo(x, highY)
          ctx.lineTo(x, lowY)
          ctx.stroke()

          const top = Math.min(openY, closeY)
          const bodyHeight = Math.max(ratio, Math.abs(closeY - openY))
          ctx.fillStyle = color
          ctx.fillRect(x - bodyWidth / 2, top, bodyWidth, bodyHeight)
        }

        ctx.restore()
      },
    },
  }
}
