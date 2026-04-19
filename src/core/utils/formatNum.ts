/**
 * Formats a number for axis tick labels.
 * - Values ≥ 1000 use locale thousands separator with no decimals.
 * - Smaller values use up to 3 significant figures.
 * - An optional unit is appended with a narrow no-break space.
 */
export function formatNum(v: number, unit?: string): string {
  const n = Math.abs(v) >= 1000
    ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : Number.isInteger(v)
      ? String(v)
      : String(parseFloat(v.toPrecision(3)))
  return unit ? `${n}\u202f${unit}` : n
}

/** Builds a uPlot axis `values` formatter that applies formatNum to every tick. */
export function makeAxisValues(unit?: string) {
  return (_u: unknown, vals: (number | null | undefined)[]) =>
    vals.map(v => (v == null ? '' : formatNum(v, unit)))
}
