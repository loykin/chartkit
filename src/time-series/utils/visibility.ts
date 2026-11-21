import type { SeriesConfig } from '../types'

export function filterHiddenSeriesIds(
  series: readonly SeriesConfig[],
  hiddenSeriesIds: readonly string[],
): string[] {
  const validIds = new Set(series.flatMap(item => item.id ? [item.id] : []))
  return [...new Set(hiddenSeriesIds)].filter(id => validIds.has(id))
}

export function updateHiddenSeriesIds(
  hiddenSeriesIds: readonly string[],
  seriesId: string,
  visible: boolean,
): string[] {
  const next = new Set(hiddenSeriesIds)
  if (visible) next.delete(seriesId)
  else next.add(seriesId)
  return [...next]
}
