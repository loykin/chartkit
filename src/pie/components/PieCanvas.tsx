import { useCallback, useEffect, useRef, useState } from 'react'
import { DefaultChartTooltip, formatNum, resolveCssVar } from '../../core'
import type { ChartFormatters, ChartTooltipRenderer } from '../../core'
import type { PieSliceConfig, PieLabelType, PieTooltipPayload, PieSliceEvent } from '../types'
import { normalizePieValue, sumPieValues } from '../utils/values'

interface TooltipState {
  x:   number
  y:   number
  idx: number
}

interface PieCanvasProps {
  slices:         PieSliceConfig[]
  sliceIndices:   number[]
  height:         number | 'fill'
  innerRadius:    number
  labelType:      PieLabelType
  labelPosition:  'inside' | 'outside'
  centerLabel?:   string
  unit?:          string
  formatters:     ChartFormatters
  renderTooltip?: (payload: PieTooltipPayload) => React.ReactNode
  renderPluginTooltip?: ChartTooltipRenderer
  tooltipEnabled: boolean
  onSliceClick?:  (event: PieSliceEvent) => void
  onSliceHover?:  (event: PieSliceEvent | null) => void
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function buildAngles(slices: PieSliceConfig[]): { start: number; end: number }[] {
  const total = sumPieValues(slices)
  if (total === 0) return slices.map(() => ({ start: 0, end: 0 }))

  const BASE = -Math.PI / 2  // 12 o'clock
  const out: { start: number; end: number }[] = []
  let cursor = BASE
  for (const s of slices) {
    const span = (normalizePieValue(s.value) / total) * Math.PI * 2
    out.push({ start: cursor, end: cursor + span })
    cursor += span
  }
  return out
}

function hitTest(
  mx: number, my: number,
  cx: number, cy: number,
  outerR: number, innerR: number,
  angles: { start: number; end: number }[],
): number {
  const dx = mx - cx, dy = my - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < innerR || dist > outerR) return -1

  let a = Math.atan2(dy, dx) + Math.PI / 2
  if (a < 0) a += Math.PI * 2

  for (let i = 0; i < angles.length; i++) {
    const s = ((angles[i].start + Math.PI / 2) + Math.PI * 2) % (Math.PI * 2)
    const e = ((angles[i].end   + Math.PI / 2) + Math.PI * 2) % (Math.PI * 2)
    if (e >= s ? (a >= s && a < e) : (a >= s || a < e)) return i
  }
  return -1
}

function sliceLabel(
  slice: PieSliceConfig,
  pct: number,
  labelType: PieLabelType,
  unit: string | undefined,
  formatters: ChartFormatters,
): string {
  const label = formatters.label?.(slice.label, {
    chartType: 'pie', purpose: 'label', seriesLabel: slice.label,
  }) ?? slice.label
  const value = formatters.value?.(slice.value, {
    chartType: 'pie', purpose: 'label', seriesLabel: slice.label, unit,
  }) ?? formatNum(slice.value, unit)
  const percentage = formatters.percentage?.(pct, {
    chartType: 'pie', purpose: 'label', seriesLabel: slice.label, unit: '%',
  }) ?? `${pct.toFixed(1)}%`

  if (labelType === 'name')         return label
  if (labelType === 'value')        return value
  if (labelType === 'percent')      return percentage
  if (labelType === 'name+percent') return `${label} ${percentage}`
  return ''
}

// ── Outside label layout ──────────────────────────────────────────────────────

const ARM_LEN   = 18   // radial arm
const ELBOW_LEN = 12   // horizontal elbow
const MIN_SPAN_OUTSIDE = 0.12  // ~7° — skip tiny slices

interface OutsideLabel {
  text:    string
  color:   string
  ax1:     number  // arm start (on outerR)
  ay1:     number
  ax2:     number  // arm end (before elbow)
  ay2:     number
  elbowX:  number  // after elbow
  isRight: boolean
  targetY: number  // desired y before deconfliction
  y:       number  // final y after deconfliction
}

function buildOutsideLabels(
  slices:    PieSliceConfig[],
  total:     number,
  angles:    { start: number; end: number }[],
  cx:        number,
  cy:        number,
  outerR:    number,
  labelType: PieLabelType,
  unit:      string | undefined,
  formatters: ChartFormatters,
): OutsideLabel[] {
  const labels: OutsideLabel[] = []

  for (let i = 0; i < slices.length; i++) {
    const { start, end } = angles[i]
    const span = end - start
    if (span < MIN_SPAN_OUTSIDE) continue

    const mid  = (start + end) / 2
    const pct  = total > 0 ? (normalizePieValue(slices[i].value) / total) * 100 : 0
    const text = sliceLabel(slices[i], pct, labelType, unit, formatters)
    if (!text) continue

    const ax1     = cx + Math.cos(mid) * outerR
    const ay1     = cy + Math.sin(mid) * outerR
    const ax2     = cx + Math.cos(mid) * (outerR + ARM_LEN)
    const ay2     = cy + Math.sin(mid) * (outerR + ARM_LEN)
    const isRight = ax2 >= cx

    labels.push({
      text, color: slices[i].color,
      ax1, ay1, ax2, ay2,
      elbowX:  ax2 + (isRight ? ELBOW_LEN : -ELBOW_LEN),
      isRight,
      targetY: ay2,
      y:       ay2,
    })
  }

  // Deconflict: separate labels that are too close vertically (per side)
  const FONT_H = 14
  for (const side of [true, false]) {
    const side_labels = labels.filter(l => l.isRight === side)
    side_labels.sort((a, b) => a.targetY - b.targetY)
    for (let i = 1; i < side_labels.length; i++) {
      const prev = side_labels[i - 1]
      const curr = side_labels[i]
      if (curr.y - prev.y < FONT_H) {
        curr.y = prev.y + FONT_H
      }
    }
  }

  return labels
}

// ── Main draw function ────────────────────────────────────────────────────────

function draw(
  canvas:        HTMLCanvasElement,
  slices:        PieSliceConfig[],
  innerRadius:   number,
  labelType:     PieLabelType,
  labelPosition: 'inside' | 'outside',
  centerLabel:   string | undefined,
  hoveredIdx:    number,
  unit:          string | undefined,
  formatters:    ChartFormatters,
) {
  const dpr = window.devicePixelRatio || 1
  const w   = canvas.offsetWidth
  const h   = canvas.offsetHeight

  canvas.width  = w * dpr
  canvas.height = h * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  if (!slices.length) return

  const total  = sumPieValues(slices)
  const angles = buildAngles(slices)
  const foreground = resolveCssVar('--chartkit-foreground', '#111111')
  const mutedForeground = resolveCssVar('--chartkit-muted-foreground', '#737373')

  // Shrink outerR when labels are outside so they fit within canvas
  const radiusRatio = labelPosition === 'outside' ? 0.62 : 0.82
  const outerR  = Math.min(w, h) / 2 * radiusRatio
  const innerR  = outerR * Math.max(0, Math.min(1, innerRadius))
  const cx      = w / 2
  const cy      = h / 2
  const gapA    = outerR > 0 ? 1.5 / outerR : 0

  // ── Slices ────────────────────────────────────────────────────────────────
  for (let i = 0; i < slices.length; i++) {
    const { start, end } = angles[i]
    const span = end - start
    const half = gapA < span ? gapA / 2 : 0
    const s    = start + half
    const e    = end   - half
    const hovered = i === hoveredIdx

    ctx.save()
    if (hovered) {
      const mid = (s + e) / 2
      ctx.translate(Math.cos(mid) * 6, Math.sin(mid) * 6)
    }

    ctx.beginPath()
    if (innerR > 0) {
      ctx.arc(cx, cy, outerR, s, e)
      ctx.arc(cx, cy, innerR, e, s, true)
    } else {
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, outerR, s, e)
    }
    ctx.closePath()

    ctx.fillStyle   = slices[i].color
    ctx.globalAlpha = hovered ? 1 : 0.9
    ctx.fill()
    ctx.restore()
  }

  // ── Inside labels ─────────────────────────────────────────────────────────
  if (labelType !== 'none' && labelPosition === 'inside') {
    const labelR = innerR > 0
      ? innerR + (outerR - innerR) * 0.5
      : outerR * 0.62

    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.font         = '600 11px system-ui, sans-serif'

    for (let i = 0; i < slices.length; i++) {
      const { start, end } = angles[i]
      if (end - start < 0.25) continue

      const mid = (start + end) / 2
      const pct = total > 0 ? (normalizePieValue(slices[i].value) / total) * 100 : 0
      const text = sliceLabel(slices[i], pct, labelType, unit, formatters)
      if (!text) continue

      const lx = cx + Math.cos(mid) * labelR
      const ly = cy + Math.sin(mid) * labelR

      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth   = 3
      ctx.strokeText(text, lx, ly)
      ctx.fillStyle   = '#ffffff'
      ctx.fillText(text, lx, ly)
    }
  }

  // ── Outside labels ────────────────────────────────────────────────────────
  if (labelType !== 'none' && labelPosition === 'outside') {
    const outsideLabels = buildOutsideLabels(
      slices, total, angles, cx, cy, outerR, labelType, unit, formatters,
    )

    ctx.font         = '500 11px system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.lineWidth    = 1

    for (const lbl of outsideLabels) {
      // Connector line: arm + elbow
      ctx.beginPath()
      ctx.moveTo(lbl.ax1, lbl.ay1)
      ctx.lineTo(lbl.ax2, lbl.ay2)
      ctx.lineTo(lbl.elbowX, lbl.y)
      ctx.strokeStyle = lbl.color
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.globalAlpha = 1

      // Label text
      ctx.textAlign = lbl.isRight ? 'left' : 'right'
      ctx.fillStyle = foreground
      ctx.fillText(lbl.text, lbl.elbowX + (lbl.isRight ? 4 : -4), lbl.y)
    }
  }

  // ── Center label (donut) ──────────────────────────────────────────────────
  if (innerR > 0 && centerLabel) {
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    const lines  = centerLabel.split('\n')
    const lineH  = 18
    const startY = cy - ((lines.length - 1) * lineH) / 2

    lines.forEach((line, i) => {
      const isFirst = i === 0 && lines.length > 1
      ctx.font      = isFirst ? '600 13px system-ui, sans-serif' : '400 11px system-ui, sans-serif'
      ctx.fillStyle = isFirst ? foreground : mutedForeground
      ctx.fillText(line, cx, startY + i * lineH)
    })
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PieCanvas({
  slices,
  sliceIndices,
  height,
  innerRadius,
  labelType,
  labelPosition,
  centerLabel,
  unit,
  formatters,
  renderTooltip,
  renderPluginTooltip,
  tooltipEnabled,
  onSliceClick,
  onSliceHover,
}: PieCanvasProps) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState(-1)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const hoveredRef = useRef(-1)
  const onSliceHoverRef = useRef(onSliceHover)
  const onSliceClickRef = useRef(onSliceClick)
  onSliceHoverRef.current = onSliceHover
  onSliceClickRef.current = onSliceClick
  const visibleSliceKey = sliceIndices.join(':')

  useEffect(() => {
    hoveredRef.current = -1
    setHovered(-1)
    setTooltip(null)
    onSliceHoverRef.current?.(null)
  }, [visibleSliceKey])

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      draw(canvasRef.current, slices, innerRadius, labelType, labelPosition, centerLabel, hovered, unit, formatters)
    }
  }, [slices, innerRadius, labelType, labelPosition, centerLabel, hovered, unit, formatters])

  useEffect(() => { redraw() }, [redraw])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(redraw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [redraw])

  const getOuterR = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const ratio = labelPosition === 'outside' ? 0.62 : 0.82
    return Math.min(canvas.offsetWidth, canvas.offsetHeight) / 2 * ratio
  }, [labelPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect   = canvas.getBoundingClientRect()
    const mx     = e.clientX - rect.left
    const my     = e.clientY - rect.top
    const outerR = getOuterR()
    const innerR = outerR * Math.max(0, Math.min(1, innerRadius))
    const cx     = canvas.offsetWidth  / 2
    const cy     = canvas.offsetHeight / 2
    const angles = buildAngles(slices)
    const idx    = hitTest(mx, my, cx, cy, outerR, innerR, angles)

    setHovered(idx)
    setTooltip(idx >= 0 ? { x: mx, y: my, idx } : null)
    if (idx !== hoveredRef.current) {
      hoveredRef.current = idx
      if (idx < 0) {
        onSliceHoverRef.current?.(null)
      } else {
        const slice = slices[idx]
        const total = sumPieValues(slices)
        onSliceHoverRef.current?.({
          slice,
          sliceIndex: sliceIndices[idx],
          percentage: total > 0 ? (normalizePieValue(slice.value) / total) * 100 : 0,
          clientX: e.clientX,
          clientY: e.clientY,
        })
      }
    }
  }, [slices, sliceIndices, innerRadius, getOuterR])

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = -1
    setHovered(-1)
    setTooltip(null)
    onSliceHoverRef.current?.(null)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const idx = hoveredRef.current
    if (idx < 0) return
    const slice = slices[idx]
    const total = sumPieValues(slices)
    onSliceClickRef.current?.({
      slice,
      sliceIndex: sliceIndices[idx],
      percentage: total > 0 ? (normalizePieValue(slice.value) / total) * 100 : 0,
      clientX: e.clientX,
      clientY: e.clientY,
    })
  }, [slices, sliceIndices])

  const total = sumPieValues(slices)

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: height === 'fill' ? '100%' : undefined }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block', width: '100%', height: height === 'fill' ? '100%' : height,
          cursor: onSliceClick ? 'pointer' : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {tooltipEnabled && tooltip && tooltip.idx >= 0 && (() => {
        const slice = slices[tooltip.idx]
        const percentage = total > 0 ? (normalizePieValue(slice.value) / total) * 100 : 0
        const originalIndex = sliceIndices[tooltip.idx]
        const localPayload = { slice, sliceIndex: originalIndex, percentage, x: tooltip.x, y: tooltip.y }
        if (renderTooltip) return renderTooltip(localPayload)

        const payload = {
          chartType: 'pie' as const,
          x: tooltip.x,
          y: tooltip.y,
          items: [{
            id: slice.id,
            itemIndex: originalIndex,
            label: formatters.label?.(slice.label, {
              chartType: 'pie', purpose: 'tooltip', seriesLabel: slice.label,
            }) ?? slice.label,
            color: slice.color,
            value: slice.value,
            formattedValue: [
              formatters.value?.(slice.value, {
                chartType: 'pie', purpose: 'tooltip', seriesLabel: slice.label, unit,
              }) ?? formatNum(slice.value, unit),
              formatters.percentage?.(percentage, {
                chartType: 'pie', purpose: 'tooltip', seriesLabel: slice.label, unit: '%',
              }) ?? `${percentage.toFixed(1)}%`,
            ].join(' · '),
            percentage,
          }],
        }
        return renderPluginTooltip
          ? renderPluginTooltip(payload)
          : <DefaultChartTooltip {...payload} />
      })()}
    </div>
  )
}
