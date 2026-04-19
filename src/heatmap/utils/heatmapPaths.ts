import uPlot from 'uplot'
import { countsToFillIndices } from './palette'

/**
 * uPlot series path builder for heatmap rendering (mode: 2).
 *
 * Expects u.data[seriesIdx] = [xs, ys, counts] (flat interleaved grid).
 * Uses Path2D batching per palette color for GPU-friendly fill calls.
 */
export function heatmapPaths(palette: string[]): uPlot.Series.PathBuilder {
  return (u, seriesIdx) => {
    uPlot.orient(
      u,
      seriesIdx,
      (
        _series,
        _dataX,
        _dataY,
        scaleX,
        scaleY,
        valToPosX,
        valToPosY,
        xOff,
        yOff,
        xDim,
        yDim,
        _moveTo,
        _lineTo,
        rect,
      ) => {
        const d = u.data[seriesIdx] as unknown as [number[], number[], number[]]
        const [xs, ys, counts] = d
        const dlen = xs.length

        if (dlen === 0) return

        // Detect bin counts from the repeating layout (y inner, x outer)
        const yBinQty  = dlen - ys.lastIndexOf(ys[0])
        const xBinQty  = dlen / yBinQty
        const yBinIncr = ys[1] - ys[0]
        const xBinIncr = xs[yBinQty] - xs[0]

        // Uniform tile sizes in canvas px at current zoom
        const xSize = valToPosX(xBinIncr, scaleX, xDim, xOff) - valToPosX(0, scaleX, xDim, xOff)
        const ySize = valToPosY(yBinIncr, scaleY, yDim, yOff) - valToPosY(0, scaleY, yDim, yOff)

        // Pre-compute pixel offsets for every unique x and y bin
        const cys = ys
          .slice(0, yBinQty)
          .map(y => Math.round(valToPosY(y, scaleY, yDim, yOff) - ySize / 2))
        const cxs = Array.from({ length: xBinQty }, (_, i) =>
          Math.round(valToPosX(xs[i * yBinQty], scaleX, xDim, xOff) - xSize / 2),
        )

        const fills  = countsToFillIndices(counts, palette.length)
        const paths  = palette.map(() => new Path2D())

        for (let i = 0; i < dlen; i++) {
          const fi = fills[i]
          if (fi < 0) continue  // zero count — skip

          // Skip cells outside the visible scale range
          if (
            xs[i] < (scaleX.min ?? -Infinity) || xs[i] > (scaleX.max ?? Infinity) ||
            ys[i] < (scaleY.min ?? -Infinity) || ys[i] > (scaleY.max ?? Infinity)
          ) continue

          rect(paths[fi], cxs[Math.floor(i / yBinQty)], cys[i % yBinQty], xSize, ySize)
        }

        u.ctx.save()
        u.ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height)
        u.ctx.clip()

        paths.forEach((p, i) => {
          u.ctx.fillStyle = palette[i]
          u.ctx.fill(p)
        })

        u.ctx.restore()
      },
    )

    return null
  }
}
