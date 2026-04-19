import { describe, it, expect } from 'vitest'
import { binHeatmap } from '../heatmap'

describe('binHeatmap', () => {
  it('returns empty bins for empty input', () => {
    const result = binHeatmap([], [], 60, 10)
    expect(result.xs.length).toBe(0)
    expect(result.ys.length).toBe(0)
    expect(result.counts.length).toBe(0)
  })

  it('places a single point in the correct bin', () => {
    // x=100 → xBin = floor(100/60)*60 = 60
    // y=25  → yBin = floor(25/10)*10  = 20
    const result = binHeatmap([100], [25], 60, 10)
    expect(result.xs).toContain(60)
    expect(result.ys).toContain(20)
    const idx = result.xs.findIndex((x, i) => x === 60 && result.ys[i] === 20)
    expect(result.counts[idx]).toBe(1)
  })

  it('accumulates multiple points in the same bin', () => {
    const result = binHeatmap([100, 110, 115], [25, 28, 22], 60, 10)
    const idx = result.xs.findIndex((x, i) => x === 60 && result.ys[i] === 20)
    expect(result.counts[idx]).toBe(3)
  })

  it('splits points across different x bins', () => {
    const result = binHeatmap([50, 130], [10, 10], 60, 10)
    // x=50 → xBin=0,  x=130 → xBin=120
    const bins = new Map<string, number>()
    result.xs.forEach((x, i) => {
      if (result.counts[i] > 0) bins.set(`${x},${result.ys[i]}`, result.counts[i])
    })
    expect(bins.get('0,10')).toBe(1)
    expect(bins.get('120,10')).toBe(1)
  })
})
