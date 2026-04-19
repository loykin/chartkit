import { useMemo } from 'react'
import type { BinResult } from '../types'

/**
 * Computes histogram bins from raw values.
 *
 * Always returns raw counts. Normalization (percentage / relative frequency)
 * is the caller's responsibility so this hook stays pure and stable.
 *
 * Default bin count: Sturges rule — ceil(log₂(n) + 1)
 */
export function useBins(values: number[], binCount?: number): BinResult {
  return useMemo(() => {
    if (!values.length) return { edges: [], counts: [], binWidth: 0 }

    const n   = values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Avoid division by zero when all values are identical
    const range    = max - min || 1
    const k        = Math.max(1, binCount ?? Math.ceil(Math.log2(n) + 1))
    const binWidth = range / k

    const edges  = Array.from({ length: k }, (_, i) => min + i * binWidth)
    const counts = new Array<number>(k).fill(0)

    for (const v of values) {
      const idx = Math.min(Math.floor((v - min) / binWidth), k - 1)
      counts[idx]++
    }

    return { edges, counts, binWidth }
  }, [values, binCount])
}
