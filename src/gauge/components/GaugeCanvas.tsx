import { useCallback, useEffect, useRef } from 'react'
import { formatNum, resolveThresholdColor } from '../../core'
import type { Threshold } from '../../core'

interface GaugeCanvasProps {
  value:      number
  min:        number
  max:        number
  unit?:      string
  label?:     string
  thresholds: Threshold[]
  arcWidth:   number   // fraction of outerR, e.g. 0.18
  height:     number
}

// ── Gauge geometry constants ──────────────────────────────────────────────────
// Arc spans 270° CW from 135° to 45° (canvas coords, 0=east CW)
// 135° = bottom-left area (7:30), 45° = bottom-right area (4:30)
// Low value is at 135°, high value is at 45°

const RAD        = Math.PI / 180
const START_DEG  = 135
const SPAN_DEG   = 270

function degToRad(d: number) { return d * RAD }

function valueToAngle(v: number, min: number, max: number): number {
  const pct = Math.max(0, Math.min(1, (v - min) / (max - min)))
  return START_DEG + pct * SPAN_DEG
}

// ── Draw ─────────────────────────────────────────────────────────────────────

function draw(
  canvas:     HTMLCanvasElement,
  value:      number,
  min:        number,
  max:        number,
  unit:       string | undefined,
  label:      string | undefined,
  thresholds: Threshold[],
  arcWidth:   number,
  height:     number,
) {
  const dpr = window.devicePixelRatio || 1
  const w   = canvas.offsetWidth
  const h   = height

  canvas.width  = w * dpr
  canvas.height = h * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const PAD    = 12
  const outerR = Math.min((w - PAD * 2) / 2, (h - PAD) / (1 + Math.sin(degToRad(135)))) * 0.92
  const innerR = outerR * (1 - arcWidth)
  const cx     = w / 2
  // place center so the bottom tips (at 135° and 45°) have PAD clearance
  const cy     = h - PAD - Math.sin(degToRad(135)) * outerR

  // ── Background arc (muted) ───────────────────────────────────────────────
  ctx.beginPath()
  ctx.arc(cx, cy, outerR, degToRad(START_DEG), degToRad(START_DEG + SPAN_DEG), false)
  ctx.arc(cx, cy, innerR, degToRad(START_DEG + SPAN_DEG), degToRad(START_DEG), true)
  ctx.closePath()
  ctx.fillStyle = 'var(--chartkit-border, #e5e7eb)'
  ctx.fill()

  // ── Threshold zone arcs ──────────────────────────────────────────────────
  const sorted = [...thresholds].sort((a, b) => a.value - b.value)
  const zones: { from: number; to: number; color: string }[] = []

  for (let i = 0; i < sorted.length; i++) {
    const from  = sorted[i].value
    const to    = sorted[i + 1]?.value ?? max
    const color = sorted[i].color
    if (to > min && from < max) {
      zones.push({ from: Math.max(from, min), to: Math.min(to, max), color })
    }
  }

  if (!zones.length) {
    // Single zone from min to max using default color
    zones.push({ from: min, to: max, color: '#3b82f6' })
  }

  for (const zone of zones) {
    const startA = degToRad(valueToAngle(zone.from, min, max))
    const endA   = degToRad(valueToAngle(zone.to,   min, max))
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, startA, endA, false)
    ctx.arc(cx, cy, innerR, endA, startA, true)
    ctx.closePath()
    ctx.fillStyle   = zone.color
    ctx.globalAlpha = 0.25
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // ── Value fill arc ───────────────────────────────────────────────────────
  const clamped  = Math.max(min, Math.min(max, value))
  const valueAng = degToRad(valueToAngle(clamped, min, max))
  const fillColor = resolveThresholdColor(clamped, thresholds, '#3b82f6')

  ctx.beginPath()
  ctx.arc(cx, cy, outerR, degToRad(START_DEG), valueAng, false)
  ctx.arc(cx, cy, innerR, valueAng, degToRad(START_DEG), true)
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()

  // ── End caps (rounded tips) ──────────────────────────────────────────────
  const capR = (outerR - innerR) / 2
  const midR = (outerR + innerR) / 2

  // Start cap
  const scx = cx + Math.cos(degToRad(START_DEG)) * midR
  const scy = cy + Math.sin(degToRad(START_DEG)) * midR
  ctx.beginPath()
  ctx.arc(scx, scy, capR, 0, Math.PI * 2)
  ctx.fillStyle = 'var(--chartkit-background, #ffffff)'
  ctx.fill()

  // End cap
  const endDeg = START_DEG + SPAN_DEG
  const ecx = cx + Math.cos(degToRad(endDeg)) * midR
  const ecy = cy + Math.sin(degToRad(endDeg)) * midR
  ctx.beginPath()
  ctx.arc(ecx, ecy, capR, 0, Math.PI * 2)
  ctx.fillStyle = 'var(--chartkit-background, #ffffff)'
  ctx.fill()

  // ── Value text ───────────────────────────────────────────────────────────
  const textY      = cy - outerR * 0.08
  const valueFSize = Math.max(14, Math.min(32, outerR * 0.38))

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = fillColor
  ctx.font         = `700 ${valueFSize}px system-ui, sans-serif`
  ctx.fillText(formatNum(value, unit), cx, textY)

  // ── Min / Max labels ─────────────────────────────────────────────────────
  const labelFSize = Math.max(9, outerR * 0.13)
  ctx.font      = `400 ${labelFSize}px system-ui, sans-serif`
  ctx.fillStyle = 'var(--chartkit-muted-foreground, #737373)'

  const minX = cx + Math.cos(degToRad(START_DEG)) * (outerR + 8)
  const minY = cy + Math.sin(degToRad(START_DEG)) * (outerR + 4)
  ctx.textAlign = 'center'
  ctx.fillText(String(min), minX, minY)

  const maxX = cx + Math.cos(degToRad(endDeg)) * (outerR + 8)
  const maxY = cy + Math.sin(degToRad(endDeg)) * (outerR + 4)
  ctx.fillText(String(max), maxX, maxY)

  // ── Bottom label ─────────────────────────────────────────────────────────
  if (label) {
    ctx.font         = `400 ${labelFSize}px system-ui, sans-serif`
    ctx.fillStyle    = 'var(--chartkit-muted-foreground, #737373)'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(label, cx, textY + valueFSize * 0.65)
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GaugeCanvas({
  value, min, max, unit, label, thresholds, arcWidth, height,
}: GaugeCanvasProps) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      draw(canvasRef.current, value, min, max, unit, label, thresholds, arcWidth, height)
    }
  }, [value, min, max, unit, label, thresholds, arcWidth, height])

  useEffect(() => { redraw() }, [redraw])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(redraw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [redraw])

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height }}
      />
    </div>
  )
}
