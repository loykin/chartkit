import type { Threshold } from '../types'

/**
 * Returns the color for a value given a sorted threshold list.
 * Thresholds define color "zones": the color of the highest threshold
 * whose value is <= the given value is used.
 *
 * Example: [{value:0,color:'green'},{value:80,color:'orange'},{value:90,color:'red'}]
 *   value=50  → 'green'
 *   value=85  → 'orange'
 *   value=95  → 'red'
 */
export function resolveThresholdColor(
  value: number,
  thresholds: Threshold[],
  defaultColor = '#3b82f6',
): string {
  if (!thresholds.length) return defaultColor
  const sorted = [...thresholds].sort((a, b) => a.value - b.value)
  let color = sorted[0].color
  for (const t of sorted) {
    if (value >= t.value) color = t.color
  }
  return color
}
