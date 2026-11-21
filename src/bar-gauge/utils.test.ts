import { describe, expect, it } from 'vitest'
import { getBarGaugeGeometry } from './utils'

const item = (value: number | null, min?: number, max?: number) => ({ id: 'x', label: 'X', value, min, max })

describe('bar gauge geometry', () => {
  it('keeps zero valid and clamps overflow geometry', () => {
    expect(getBarGaugeGeometry(item(0)).value).toBe(0)
    expect(getBarGaugeGeometry(item(150)).valuePercent).toBe(100)
  })

  it('positions mixed-sign values around the zero baseline', () => {
    expect(getBarGaugeGeometry(item(-25, -100, 100))).toMatchObject({ zeroPercent: 50, segmentStart: 37.5, segmentSize: 12.5 })
    expect(getBarGaugeGeometry(item(50, -100, 100))).toMatchObject({ zeroPercent: 50, segmentStart: 50, segmentSize: 25 })
  })

  it('handles missing and degenerate ranges without invalid geometry', () => {
    expect(getBarGaugeGeometry(item(null))).toMatchObject({ value: null, segmentSize: 0 })
    expect(getBarGaugeGeometry(item(5, 5, 5)).segmentSize).toBe(100)
    expect(getBarGaugeGeometry(item(Number.NaN)).value).toBeNull()
  })
})
