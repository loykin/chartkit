/** Convert a hex color string to rgba() with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Canvas ctx.strokeStyle / fillStyle cannot resolve CSS custom properties.
 * Read the computed value from the document root and return it as-is
 * (the value is already a complete color string such as `oklch(0.556 0 0)`).
 *
 * Falls back to `fallback` in SSR environments or when the variable is unset.
 */
export function resolveCssVar(variable: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
  return val || fallback
}
