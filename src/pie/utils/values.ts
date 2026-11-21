import type { PieSliceConfig } from '../types'

export function normalizePieValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function sumPieValues(slices: readonly PieSliceConfig[]): number {
  return slices.reduce((sum, slice) => sum + normalizePieValue(slice.value), 0)
}
