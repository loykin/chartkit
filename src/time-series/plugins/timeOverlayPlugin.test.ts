import { describe, expect, it } from 'vitest'
import { MAX_TIME_OVERLAYS, normalizeTimeOverlays } from './timeOverlayPlugin'

describe('time overlays', () => {
  it('rejects invalid values and reversed regions without mutating input', () => {
    const markers = [{ id: 'ok', x: 1 }, { id: 'bad', x: Number.NaN }]
    const regions = [
      { id: 'point', xStart: 2, xEnd: 2 },
      { id: 'reversed', xStart: 4, xEnd: 3 },
    ]
    expect(normalizeTimeOverlays({ markers, regions })).toEqual({
      markers: [markers[0]],
      regions: [regions[0]],
    })
    expect(markers).toHaveLength(2)
    expect(regions).toHaveLength(2)
  })

  it('caps large collections predictably', () => {
    const markers = Array.from({ length: MAX_TIME_OVERLAYS + 5 }, (_, x) => ({ id: String(x), x }))
    expect(normalizeTimeOverlays({ markers }).markers).toHaveLength(MAX_TIME_OVERLAYS)
  })
})
