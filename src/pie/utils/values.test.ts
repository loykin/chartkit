import { describe, expect, it } from 'vitest'
import { normalizePieValue, sumPieValues } from './values'

describe('pie values', () => {
  it('uses only positive finite values for geometry', () => {
    expect(normalizePieValue(12)).toBe(12)
    expect(normalizePieValue(0)).toBe(0)
    expect(normalizePieValue(-4)).toBe(0)
    expect(normalizePieValue(Number.NaN)).toBe(0)
    expect(normalizePieValue(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('calculates a safe visible total', () => {
    expect(sumPieValues([
      { label: 'valid', value: 4, color: '#00f' },
      { label: 'negative', value: -3, color: '#f00' },
      { label: 'invalid', value: Number.NaN, color: '#000' },
    ])).toBe(4)
  })
})
