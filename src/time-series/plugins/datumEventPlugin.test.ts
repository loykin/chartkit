import { describe, expect, it } from 'vitest'
import type uPlot from 'uplot'
import { resolveDatumEvent } from './datumEventPlugin'

function chart() {
  return {
    over: { getBoundingClientRect: () => ({ left: 100, top: 50 }) },
    posToIdx: () => 1,
    series: [{}, { show: true, scale: 'y' }, { show: true, scale: 'y' }],
    data: [[10, 20], [1, 3], [8, 5]],
    valToPos: (value: number) => value * 10,
  } as unknown as uPlot
}

const mouse = { clientX: 120, clientY: 82 } as MouseEvent

describe('resolveDatumEvent', () => {
  it('returns the nearest visible series with original data coordinates', () => {
    const result = resolveDatumEvent(chart(), mouse, {
      data: [[10, 20], [1, 3], [8, 5]],
      series: [
        { id: 'cpu', label: 'CPU', color: 'blue' },
        { id: 'memory', label: 'Memory', color: 'green' },
      ],
      toInputSeriesIndex: index => index - 1,
    })

    expect(result).toEqual({
      seriesId: 'cpu', datumIndex: 1, x: 20, y: 3, clientX: 120, clientY: 82,
    })
  })

  it('uses input-index fallback identity and preserves stacked series mapping', () => {
    const result = resolveDatumEvent(chart(), mouse, {
      data: [[10, 20], [1, 3], [8, 5]],
      series: [
        { label: 'CPU', color: 'blue' },
        { label: 'Memory', color: 'green' },
      ],
      toInputSeriesIndex: index => 2 - index,
    })

    expect(result?.seriesId).toBe('1')
    expect(result?.y).toBe(5)
  })
})
