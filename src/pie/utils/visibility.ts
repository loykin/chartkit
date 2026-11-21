import type { PieSliceConfig } from '../types'

export function filterHiddenSliceIds(
  slices: readonly PieSliceConfig[],
  hiddenSliceIds: readonly string[],
): string[] {
  const validIds = new Set(slices.flatMap(slice => slice.id ? [slice.id] : []))
  return [...new Set(hiddenSliceIds)].filter(id => validIds.has(id))
}

export function updateHiddenSliceIds(
  hiddenSliceIds: readonly string[],
  sliceId: string,
  visible: boolean,
): string[] {
  const next = new Set(hiddenSliceIds)
  if (visible) next.delete(sliceId)
  else next.add(sliceId)
  return [...next]
}
