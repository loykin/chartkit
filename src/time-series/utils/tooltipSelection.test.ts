import { describe, expect, it } from 'vitest'
import { applyTooltipPolicy } from './tooltipSelection'
import type { LegendItem } from '../hooks/useLegendState'

const items = [1, 2, 3].map(index => ({
  index,
  label: `series-${index}`,
  color: '#000',
  visible: true,
  value: index,
  stats: { min: index, max: index, avg: index, last: index },
})) satisfies LegendItem[]

describe('tooltip selection policy', () => {
  it('keeps all items by default', () => {
    expect(applyTooltipPolicy(items, {})).toEqual(items)
  })

  it('selects the deterministic nearest item', () => {
    expect(applyTooltipPolicy(items, { mode: 'nearest' }, 1)).toEqual([items[1]])
  })

  it('applies a non-negative integer limit after selection', () => {
    expect(applyTooltipPolicy(items, { maxItems: 1.9 })).toEqual([items[0]])
    expect(applyTooltipPolicy(items, { maxItems: -1 })).toEqual([])
  })
})
