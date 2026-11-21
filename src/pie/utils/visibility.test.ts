import { describe, expect, it } from 'vitest'
import { filterHiddenSliceIds, updateHiddenSliceIds } from './visibility'

const slices = [
  { id: 'api', label: 'API', value: 60, color: '#00f' },
  { id: 'worker', label: 'Worker', value: 40, color: '#0f0' },
]

describe('pie visibility helpers', () => {
  it('preserves hidden identity across reorder', () => {
    expect(filterHiddenSliceIds([...slices].reverse(), ['api'])).toEqual(['api'])
  })

  it('ignores removed and duplicate identities', () => {
    expect(filterHiddenSliceIds(slices, ['api', 'removed', 'api'])).toEqual(['api'])
  })

  it('updates visibility without mutating the input', () => {
    const hidden = ['api']
    expect(updateHiddenSliceIds(hidden, 'worker', false)).toEqual(['api', 'worker'])
    expect(updateHiddenSliceIds(hidden, 'api', true)).toEqual([])
    expect(hidden).toEqual(['api'])
  })
})
