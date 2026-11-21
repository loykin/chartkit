import { describe, expect, it } from 'vitest'
import { filterHiddenSeriesIds, updateHiddenSeriesIds } from './visibility'

const series = [
  { id: 'cpu', label: 'CPU', color: '#00f' },
  { id: 'memory', label: 'Memory', color: '#0f0' },
]

describe('series visibility helpers', () => {
  it('keeps stable hidden identities when series are reordered', () => {
    const reordered = [...series].reverse()
    expect(filterHiddenSeriesIds(reordered, ['cpu'])).toEqual(['cpu'])
  })

  it('ignores removed, duplicate, and unknown identities', () => {
    expect(filterHiddenSeriesIds(series, ['cpu', 'removed', 'cpu'])).toEqual(['cpu'])
  })

  it('adds and removes hidden identities without mutating the input', () => {
    const hidden = ['cpu']
    expect(updateHiddenSeriesIds(hidden, 'memory', false)).toEqual(['cpu', 'memory'])
    expect(updateHiddenSeriesIds(hidden, 'cpu', true)).toEqual([])
    expect(hidden).toEqual(['cpu'])
  })
})
