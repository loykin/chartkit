import { describe, it, expect } from 'vitest'
import { resolveThresholdColor } from '../core'

const thresholds = [
  { value: 0,  color: 'green'  },
  { value: 80, color: 'orange' },
  { value: 90, color: 'red'    },
]

describe('resolveThresholdColor', () => {
  it('returns defaultColor when thresholds is empty', () => {
    expect(resolveThresholdColor(50, [])).toBe('#3b82f6')
    expect(resolveThresholdColor(50, [], '#ff0000')).toBe('#ff0000')
  })

  it('returns first threshold color when value is at the first boundary', () => {
    expect(resolveThresholdColor(0, thresholds)).toBe('green')
  })

  it('uses the highest threshold whose value is <= given value', () => {
    expect(resolveThresholdColor(50,  thresholds)).toBe('green')
    expect(resolveThresholdColor(80,  thresholds)).toBe('orange')
    expect(resolveThresholdColor(85,  thresholds)).toBe('orange')
    expect(resolveThresholdColor(90,  thresholds)).toBe('red')
    expect(resolveThresholdColor(100, thresholds)).toBe('red')
  })

  it('handles unsorted thresholds', () => {
    const unsorted = [
      { value: 90, color: 'red'    },
      { value: 0,  color: 'green'  },
      { value: 80, color: 'orange' },
    ]
    expect(resolveThresholdColor(85, unsorted)).toBe('orange')
  })

  it('returns first color for values below the first threshold', () => {
    const t = [{ value: 10, color: 'blue' }, { value: 50, color: 'red' }]
    // value=5 < 10, but resolveThresholdColor returns sorted[0].color as initial
    expect(resolveThresholdColor(5, t)).toBe('blue')
  })
})
