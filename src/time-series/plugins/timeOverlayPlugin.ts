import type uPlot from 'uplot'
import type { TimeSeriesMarker, TimeSeriesRegion } from '../types'

export const MAX_TIME_OVERLAYS = 1000

export interface TimeOverlayPluginOptions {
  markers?: readonly TimeSeriesMarker[]
  regions?: readonly TimeSeriesRegion[]
  onMarkerClick?: (marker: TimeSeriesMarker) => void
  onRegionClick?: (region: TimeSeriesRegion) => void
}

export function normalizeTimeOverlays(options: TimeOverlayPluginOptions) {
  return {
    markers: (options.markers ?? [])
      .filter(marker => Number.isFinite(marker.x))
      .slice(0, MAX_TIME_OVERLAYS),
    regions: (options.regions ?? [])
      .filter(region => Number.isFinite(region.xStart)
        && Number.isFinite(region.xEnd)
        && region.xEnd >= region.xStart)
      .slice(0, MAX_TIME_OVERLAYS),
  }
}

export function timeOverlayPlugin(options: TimeOverlayPluginOptions): uPlot.Plugin {
  const { markers, regions } = normalizeTimeOverlays(options)
  let chart: uPlot | null = null
  let pointerDown: { x: number; y: number } | null = null
  let dragged = false

  const handleMouseDown = (event: MouseEvent) => {
    pointerDown = { x: event.clientX, y: event.clientY }
    dragged = false
  }
  const handleMouseMove = (event: MouseEvent) => {
    if (!pointerDown) return
    dragged ||= Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) >= 4
  }
  const handleMouseUp = () => { pointerDown = null }

  const handleClick = (event: MouseEvent) => {
    if (!chart) return
    if (dragged) {
      dragged = false
      return
    }
    const rect = chart.over.getBoundingClientRect()
    const x = event.clientX - rect.left

    let closestMarker: TimeSeriesMarker | undefined
    let closestDistance = Number.POSITIVE_INFINITY
    for (const marker of markers) {
      const distance = Math.abs(chart.valToPos(marker.x, 'x') - x)
      if (distance <= 5 && distance < closestDistance) {
        closestMarker = marker
        closestDistance = distance
      }
    }
    if (closestMarker) {
      options.onMarkerClick?.(closestMarker)
      return
    }

    const xValue = chart.posToVal(x, 'x')
    for (let index = regions.length - 1; index >= 0; index--) {
      const region = regions[index]
      if (xValue >= region.xStart && xValue <= region.xEnd) {
        options.onRegionClick?.(region)
        return
      }
    }
  }

  return {
    hooks: {
      init(u: uPlot) {
        chart = u
        u.over.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        u.over.addEventListener('click', handleClick)
      },
      draw: [(u: uPlot) => {
        const { ctx, bbox } = u
        const dpr = devicePixelRatio
        const right = bbox.left + bbox.width
        const bottom = bbox.top + bbox.height

        ctx.save()
        ctx.beginPath()
        ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height)
        ctx.clip()

        for (const region of regions) {
          const rawStart = u.valToPos(region.xStart, 'x', true)
          const rawEnd = u.valToPos(region.xEnd, 'x', true)
          if (rawEnd < bbox.left || rawStart > right) continue
          const start = Math.max(bbox.left, rawStart)
          const end = Math.min(right, rawEnd)
          ctx.fillStyle = region.color ?? '#6388f2'
          ctx.globalAlpha = Math.max(0, Math.min(1, region.opacity ?? 0.12))
          ctx.fillRect(start, bbox.top, Math.max(dpr, end - start), bbox.height)
          ctx.globalAlpha = 1
          if (region.label) {
            ctx.fillStyle = region.color ?? '#4f6fd1'
            ctx.font = `${11 * dpr}px system-ui, sans-serif`
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText(region.label, start + 4 * dpr, bbox.top + 4 * dpr)
          }
        }

        for (const marker of markers) {
          const x = u.valToPos(marker.x, 'x', true)
          if (x < bbox.left || x > right) continue
          ctx.beginPath()
          ctx.moveTo(x, bbox.top)
          ctx.lineTo(x, bottom)
          ctx.strokeStyle = marker.color ?? '#6388f2'
          ctx.lineWidth = Math.max(0.5, marker.width ?? 1) * dpr
          ctx.setLineDash((marker.dash ?? [4, 3]).map(value => value * dpr))
          ctx.stroke()
          if (marker.label) {
            ctx.fillStyle = marker.color ?? '#4f6fd1'
            ctx.font = `${11 * dpr}px system-ui, sans-serif`
            ctx.textAlign = 'left'
            ctx.textBaseline = 'bottom'
            ctx.fillText(marker.label, x + 4 * dpr, bottom - 4 * dpr)
          }
        }
        ctx.restore()
      }],
      destroy(u: uPlot) {
        u.over.removeEventListener('click', handleClick)
        u.over.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        chart = null
      },
    },
  }
}
