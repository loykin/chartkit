import type uPlot from 'uplot'
import type { SelectionMode, SelectionResult } from '../types'

interface SelectionPluginOptions {
  mode:      SelectionMode
  onSelect?: (result: SelectionResult) => void
}

interface DragState {
  active:   boolean
  startX:   number
  startY:   number
  currentX: number
  currentY: number
}

/**
 * Generic uPlot plugin for x / y / xy range selection via mouse drag.
 *
 * Coordinates: u.over is the plot area element (axes excluded), so mouse
 * positions relative to the overlay are already in plot-area CSS pixel space.
 * u.posToVal(cssPx, axis) converts directly — no bbox offset adjustment needed.
 *
 * Returns raw data-space values. Chart components are responsible for
 * interpreting what those numbers mean (timestamps, bins, etc.).
 */
export function selectionPlugin({ mode, onSelect }: SelectionPluginOptions): uPlot.Plugin {
  if (mode === 'none') return { hooks: {} }

  let u:        uPlot
  let prevOver: HTMLElement | null = null
  let selBox:   HTMLDivElement
  let drag: DragState = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 }

  function plotWidth()  { return u.bbox.width  / devicePixelRatio }
  function plotHeight() { return u.bbox.height / devicePixelRatio }

  function clampX(x: number) { return Math.max(0, Math.min(plotWidth(),  x)) }
  function clampY(y: number) { return Math.max(0, Math.min(plotHeight(), y)) }

  // Coords relative to u.over so they match posToVal()
  function getOverlayCoords(e: MouseEvent): { x: number; y: number } {
    const rect = u.over.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function updateSelBox() {
    const w = plotWidth()
    const h = plotHeight()

    const x0 = clampX(Math.min(drag.startX, drag.currentX))
    const x1 = clampX(Math.max(drag.startX, drag.currentX))
    const y0 = clampY(Math.min(drag.startY, drag.currentY))
    const y1 = clampY(Math.max(drag.startY, drag.currentY))

    // Stretch to full axis when mode restricts the other axis
    selBox.style.left    = `${mode === 'y' ? 0 : x0}px`
    selBox.style.top     = `${mode === 'x' ? 0 : y0}px`
    selBox.style.width   = `${mode === 'y' ? w : x1 - x0}px`
    selBox.style.height  = `${mode === 'x' ? h : y1 - y0}px`
    selBox.style.display = 'block'
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return
    const { x, y } = getOverlayCoords(e)
    drag = { active: true, startX: x, startY: y, currentX: x, currentY: y }
    selBox.style.display = 'none'
    e.stopPropagation()   // prevent uPlot's own drag handling
    e.preventDefault()
  }

  function onMouseMove(e: MouseEvent) {
    if (!drag.active) return
    const { x, y } = getOverlayCoords(e)
    drag.currentX = x
    drag.currentY = y
    updateSelBox()
  }

  function onMouseUp(e: MouseEvent) {
    if (!drag.active) return
    drag.active = false
    selBox.style.display = 'none'

    const { x: endX, y: endY } = getOverlayCoords(e)
    const dx = Math.abs(endX - drag.startX)
    const dy = Math.abs(endY - drag.startY)
    if (dx < 4 && dy < 4) return   // treat as a click, ignore

    const result: SelectionResult = {}

    if (mode === 'x' || mode === 'xy') {
      const [a, b] = [
        u.posToVal(clampX(drag.startX), 'x'),
        u.posToVal(clampX(endX),        'x'),
      ].sort((p, q) => p - q) as [number, number]
      result.xRange = [a, b]
    }
    if (mode === 'y' || mode === 'xy') {
      // Lower pixel = higher value on a typical y-axis
      const [a, b] = [
        u.posToVal(clampY(drag.startY), 'y'),
        u.posToVal(clampY(endY),        'y'),
      ].sort((p, q) => p - q) as [number, number]
      result.yRange = [a, b]
    }

    onSelect?.(result)
  }

  return {
    hooks: {
      init(chart: uPlot) {
        // Clean up previous instance (React StrictMode / hot reload)
        prevOver?.removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove',    onMouseMove)
        window.removeEventListener('mouseup',      onMouseUp)
        selBox?.remove()
        if (prevOver) prevOver.style.cursor = ''

        u = chart

        // selBox is the only injected element — no opaque overlay so uPlot's
        // filtTarg check (e.target === u.over) continues to pass for mousemove
        selBox = document.createElement('div')
        selBox.style.cssText = [
          'position:absolute', 'display:none', 'pointer-events:none',
          'background:rgba(99,136,242,0.15)',
          'border:1px solid rgba(99,136,242,0.6)',
          'z-index:11',
        ].join(';')

        u.over.appendChild(selBox)
        u.over.style.cursor = 'crosshair'

        // Listen on u.over directly so e.target stays u.over for uPlot's filtTarg
        u.over.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove',  onMouseMove)
        window.addEventListener('mouseup',    onMouseUp)

        prevOver = u.over
      },

      destroy() {
        prevOver?.removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mousemove',    onMouseMove)
        window.removeEventListener('mouseup',      onMouseUp)
        selBox?.remove()
        if (prevOver) prevOver.style.cursor = ''
      },
    },
  }
}
