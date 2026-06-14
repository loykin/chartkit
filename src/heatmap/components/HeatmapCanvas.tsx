import { useCallback, useMemo } from 'react'
import uPlot from 'uplot'
import { useChart, resolveAxisStyles, makeAxisBorderPlugin, CHART_DEFAULT_LINE_WIDTH, makeAxisValues } from '../../core'
import type { AxisConfig, LineStyle } from '../../core'
import { heatmapPaths } from '../utils/heatmapPaths'
import { GRAD_METAL } from '../utils/palette'
import type { HeatmapBinnedData } from '../utils/binData'

interface HeatmapCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  binned:       HeatmapBinnedData
  height:       number | 'fill'
  xTime?:       boolean
  locale?:      string
  yUnit?:       string
  palette?:     string[]
  gridStyle?:   LineStyle | false
  axisStyle?:   AxisConfig | false
}

export function HeatmapCanvas({
  containerRef,
  binned,
  height,
  xTime = true,
  locale,
  yUnit,
  palette = GRAD_METAL,
  gridStyle,
  axisStyle,
}: HeatmapCanvasProps) {
  const getOptions = useCallback((): uPlot.Options => {
    const { mutedFgColor, axisColor, resolvedGrid, resolvedTicks, axisLineStyle } =
      resolveAxisStyles(gridStyle, axisStyle)

    const yAxisValues = makeAxisValues(yUnit)

    return {
      width:  300,
      height: height === 'fill' ? 300 : height,
      mode:   2 as uPlot.Mode,
      legend: { show: false },
      cursor: { drag: { x: true, y: true }, points: { show: false } },
      scales: {
        x: { time: xTime },
        y: { auto: true },
      },
      axes: [
        {
          space:  xTime ? 80 : 60,
          size:   40,
          stroke: mutedFgColor,
          ticks:  resolvedTicks,
          grid:   resolvedGrid,
          ...(xTime && locale != null
            ? {
                values: (_u: uPlot, splits: number[]) =>
                  splits.map(s =>
                    s == null ? '' : new Date(s * 1000).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                  ),
              }
            : {}),
        },
        {
          size:   54,
          stroke: mutedFgColor,
          values: yAxisValues,
          ticks:  resolvedTicks,
          grid:   resolvedGrid,
        },
      ],
      series: [
        {},
        {
          paths:  heatmapPaths(palette),
          points: { show: false },
          facets: [
            { scale: 'x', auto: true, sorted: 1 },
            { scale: 'y', auto: true },
          ],
        },
      ],
      plugins: [
        makeAxisBorderPlugin(axisLineStyle, axisColor, CHART_DEFAULT_LINE_WIDTH),
      ],
    }
  }, [height, xTime, locale, yUnit, palette, gridStyle, axisStyle])

  // mode: 2 data layout: [null, [xs, ys, counts]]
  const data = useMemo(
    () => [null, [binned.xs, binned.ys, binned.counts]] as unknown as uPlot.AlignedData,
    [binned],
  )

  useChart({ containerRef, getOptions, data, fillParent: height === 'fill' })

  return null
}
