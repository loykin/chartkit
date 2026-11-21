import { describe, expect, it } from 'vitest'
import type uPlot from 'uplot'
import { resolveBarDatumEvent } from '../bar/utils/datumEvent'
import { resolveHistogramDatumEvent } from '../histogram/utils/datumEvent'
import { resolveScatterDatumEvent } from '../scatter/utils/datumEvent'

const pointer = (clientX: number, clientY: number) => ({ clientX, clientY }) as MouseEvent

describe('coordinate chart datum events', () => {
  it('resolves the nearest scatter point', () => {
    const chart = {
      over: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
      series: [{}, { show: true }],
      valToPos: (value: number) => value,
    } as unknown as uPlot

    expect(resolveScatterDatumEvent(chart, pointer(10, 20), [
      { id: 'requests', label: 'Requests', color: 'blue', xs: [10, 50], ys: [20, 60] },
    ])).toMatchObject({ seriesId: 'requests', datumIndex: 0, x: 10, y: 20 })
  })

  it('resolves the exact grouped bar and category label', () => {
    const chart = {
      over: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 }) },
      valToPos: (value: number, scale: string) => scale === 'x' ? 50 + value * 100 : 100 - value,
    } as unknown as uPlot

    const result = resolveBarDatumEvent(
      chart,
      pointer(30, 75),
      ['Jan', 'Feb'],
      [
        { id: 'api', label: 'API', color: 'blue', values: [25, 30] },
        { id: 'web', label: 'Web', color: 'green', values: [40, 50] },
      ],
      'vertical',
      false,
    )

    expect(result).toMatchObject({ seriesId: 'api', datumIndex: 0, x: 'Jan', y: 25 })
  })

  it('resolves a histogram bin using its configured identity', () => {
    const chart = {
      over: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
      posToIdx: () => 1,
      valToPos: (value: number) => 100 - value,
    } as unknown as uPlot

    expect(resolveHistogramDatumEvent(
      chart, pointer(20, 70), 'latency', [0, 10, 20], [5, 40, 10],
    )).toMatchObject({ seriesId: 'latency', datumIndex: 1, x: 10, y: 40 })
  })
})
