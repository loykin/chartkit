const { floor, round } = Math

function fixFloat(v: number) {
  return round(v * 1e14) / 1e14
}

function incrRoundDn(num: number, incr: number) {
  return fixFloat(floor(fixFloat(num / incr)) * incr)
}

export interface HeatmapBinnedData {
  /** Flat x bin center values — length = xBinQty * yBinQty */
  xs: number[]
  /** Flat y bin center values — same length */
  ys: number[]
  /** Count per cell — same length */
  counts: number[]
}

/**
 * Bins flat (xs, ys) point arrays into a 2-D heatmap grid.
 *
 * Output is a flat interleaved layout:
 *   index = xi * yBinQty + yi
 *
 * This matches the layout expected by heatmapPaths() and countsToFills().
 */
export function binHeatmap(
  xs: number[],
  ys: number[],
  xBinSize: number,
  yBinSize: number,
): HeatmapBinnedData {
  const len = xs.length
  const binX = (v: number) => incrRoundDn(v, xBinSize)
  const binY = (v: number) => incrRoundDn(v, yBinSize)

  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  for (let i = 0; i < len; i++) {
    if (xs[i] < minX) minX = xs[i]
    if (xs[i] > maxX) maxX = xs[i]
    if (ys[i] < minY) minY = ys[i]
    if (ys[i] > maxY) maxY = ys[i]
  }

  const minXBin = binX(minX)
  const maxXBin = binX(maxX)
  const minYBin = binY(minY)
  const maxYBin = binY(maxY)

  const xBinQty = round((maxXBin - minXBin) / xBinSize) + 1
  const yBinQty = round((maxYBin - minYBin) / yBinSize) + 1
  const total   = xBinQty * yBinQty

  const flatXs   = new Array<number>(total)
  const flatYs   = new Array<number>(total)
  const counts   = new Array<number>(total).fill(0)

  // Build grid layout: iterate column-major (x outer, y inner)
  for (let i = 0, yi = 0, x = minXBin; i < total; yi = ++i % yBinQty) {
    flatYs[i] = minYBin + yi * yBinSize
    if (yi === 0 && i >= yBinQty) x += xBinSize
    flatXs[i] = x
  }

  // Tally counts
  for (let i = 0; i < len; i++) {
    const xi = round((binX(xs[i]) - minXBin) / xBinSize)
    const yi = round((binY(ys[i]) - minYBin) / yBinSize)
    counts[xi * yBinQty + yi]++
  }

  return { xs: flatXs, ys: flatYs, counts }
}
