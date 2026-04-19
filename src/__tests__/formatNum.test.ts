import { describe, it, expect } from 'vitest'
import { formatNum } from '../core'

describe('formatNum', () => {
  it('returns integer strings as-is for small integers', () => {
    expect(formatNum(0)).toBe('0')
    expect(formatNum(42)).toBe('42')
    expect(formatNum(-7)).toBe('-7')
  })

  it('formats numbers >= 1000 with locale separators', () => {
    const result = formatNum(1500)
    // locale-dependent but must contain "1" and "500"
    expect(result).toMatch(/1.500|1,500/)
  })

  it('appends unit with narrow no-break space', () => {
    expect(formatNum(42, 'ms')).toBe('42\u202fms')
    expect(formatNum(1000, '%')).toMatch(/1[,.]000\u202f%/)
  })

  it('trims trailing zeros for small decimals via toPrecision(3)', () => {
    // 3.14159 → toPrecision(3) = "3.14"
    expect(formatNum(3.14159)).toBe('3.14')
  })

  it('handles negative numbers', () => {
    expect(formatNum(-42, 'ms')).toBe('-42\u202fms')
  })
})
