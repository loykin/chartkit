import type { LegendItem } from '../hooks/useLegendState'
import type { TooltipPolicy } from '../types'

export function applyTooltipPolicy(
  items: readonly LegendItem[],
  policy: TooltipPolicy,
  nearestItemIndex?: number,
): LegendItem[] {
  const selected = policy.mode === 'nearest'
    ? items.filter(item => item.index - 1 === nearestItemIndex).slice(0, 1)
    : [...items]

  if (policy.maxItems === undefined) return selected
  const limit = Math.max(0, Math.floor(policy.maxItems))
  return selected.slice(0, limit)
}
