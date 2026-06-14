import { useCallback, useMemo } from 'react'
import uPlot from 'uplot'
import { useChart, resolveAxisStyles, makeAxisBorderPlugin, CHART_DEFAULT_LINE_WIDTH, makeAxisValues } from '../../core'
import type { AxisConfig, LineStyle } from '../../core'
import type { ScatterSeriesConfig } from '../types'

interface ScatterCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  series:       ScatterSeriesConfig[]
  height:       number | 'fill'
  xUnit?:       string
  yUnit?:       string
  gridStyle?:   LineStyle | false
  axisStyle?:   AxisConfig | false
}

/** uPlot path builder that renders scatter points as filled circles (mode: 2). */
function makeScatterPaths(color: string, size: number): uPlot.Series.PathBuilder {
  const r = size / 2
  return (u, seriesIdx) => {
    uPlot.orient(
      u,
      seriesIdx,
      (
        _series, _dataX, _dataY, scaleX, scaleY,
        valToPosX, valToPosY, xOff, yOff, xDim, yDim,
        moveTo, _lineTo, _rect, arc,
      ) => {
        const d  = u.data[seriesIdx] as unknown as [number[], number[]]
        const xs = d[0]
        const ys = d[1]
        if (!xs?.length) return

        const path = new Path2D()

        for (let i = 0; i < xs.length; i++) {
          if (
            xs[i] < (scaleX.min ?? -Infinity) || xs[i] > (scaleX.max ?? Infinity) ||
            ys[i] < (scaleY.min ?? -Infinity) || ys[i] > (scaleY.max ?? Infinity)
          ) continue

          const cx = valToPosX(xs[i], scaleX, xDim, xOff)
          const cy = valToPosY(ys[i], scaleY, yDim, yOff)

          // moveTo prevents canvas from connecting adjacent arcs with a line
          moveTo(path, cx + r, cy)
          arc(path, cx, cy, r, 0, Math.PI * 2)
        }

        u.ctx.save()
        u.ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height)
        u.ctx.clip()
        u.ctx.fillStyle = color
        u.ctx.fill(path)
        u.ctx.restore()
      },
    )
    return null
  }
}

export function ScatterCanvas({
  containerRef,
  series,
  height,
  xUnit,
  yUnit,
  gridStyle,
  axisStyle,
}: ScatterCanvasProps) {
  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    return {
      width:  300,
      height: height === 'fill' ? 300 : height,
      mode:   2 as uPlot.Mode,
      legend: { show: false },
      cursor: { points: { show: false } },
      scales: {
        x: { time: false, auto: true },
        y: { auto: true },
      },
      axes: [
        {
          space:  60,
          size:   40,
          stroke: mutedFgColor,
          ticks:  resolvedTicks,
          grid:   resolvedGrid,
          values: makeAxisValues(xUnit),
        },
        {
          size:   54,
          stroke: mutedFgColor,
          ticks:  resolvedTicks,
          grid:   resolvedGrid,
          values: makeAxisValues(yUnit),
        },
      ],
      series: [
        {},
        ...series.map(s => ({
          label:  s.label,
          stroke: s.color,
          fill:   s.color,
          paths:  makeScatterPaths(s.color, (s.pointSize ?? 4) * devicePixelRatio),
          points: { show: false },
          facets: [
            { scale: 'x', auto: true },
            { scale: 'y', auto: true },
          ] as uPlot.Series.Facet[],
        })),
      ],
      plugins: [
        makeAxisBorderPlugin(axisLineStyle, axisColor, CHART_DEFAULT_LINE_WIDTH),
      ],
    }
  }, [series, height, xUnit, yUnit, gridStyle, axisStyle])

  // mode: 2 data: [null, [xs1, ys1], [xs2, ys2], ...]
  const data = useMemo(
    () => [null, ...series.map(s => [s.xs, s.ys])] as unknown as uPlot.AlignedData,
    [series],
  )

  useChart({ containerRef, getOptions, data, fillParent: height === 'fill' })

  return null
}
