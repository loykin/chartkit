import { describe, expect, it } from 'vitest'
import { resolveTimeSeriesSync } from './sync'

describe('resolveTimeSeriesSync', () => {
  it('keeps charts independent by default', () => {
    expect(resolveTimeSeriesSync()).toBeUndefined()
    expect(resolveTimeSeriesSync(false)).toBeUndefined()
  })

  it('maps an explicit group to uPlot cursor synchronization', () => {
    expect(resolveTimeSeriesSync({ id: 'details' })).toEqual({
      key: 'details',
      setSeries: true,
    })
  })

  it('can disable series focus and visibility synchronization', () => {
    expect(resolveTimeSeriesSync({ id: 'cursor-only', series: false })).toEqual({
      key: 'cursor-only',
      setSeries: false,
    })
  })
})
