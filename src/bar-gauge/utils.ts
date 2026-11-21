import type { BarGaugeItem } from './types'

export interface BarGaugeGeometry {
  min: number
  max: number
  value: number | null
  valuePercent: number
  zeroPercent: number
  segmentStart: number
  segmentSize: number
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function getBarGaugeGeometry(item: BarGaugeItem, defaultMin = 0, defaultMax = 100): BarGaugeGeometry {
  const min = Number.isFinite(item.min) ? item.min! : defaultMin
  const max = Number.isFinite(item.max) ? item.max! : defaultMax
  const value = item.value != null && Number.isFinite(item.value) ? item.value : null

  if (!(max > min)) {
    const valuePercent = value != null && value >= max ? 100 : 0
    return { min, max, value, valuePercent, zeroPercent: 0, segmentStart: 0, segmentSize: valuePercent }
  }

  const toPercent = (input: number) => clamp(((input - min) / (max - min)) * 100)
  const valuePercent = value == null ? 0 : toPercent(value)
  const zeroPercent = toPercent(0)
  return {
    min, max, value, valuePercent, zeroPercent,
    segmentStart: Math.min(valuePercent, zeroPercent),
    segmentSize: Math.abs(valuePercent - zeroPercent),
  }
}
