import type uPlot from 'uplot'
import type { TimeSeriesSyncConfig } from '../types'

export function resolveTimeSeriesSync(
  sync?: false | TimeSeriesSyncConfig,
): uPlot.Cursor.Sync | undefined {
  if (!sync) return undefined
  return { key: sync.id, setSeries: sync.series ?? true }
}
