import type uPlot from 'uplot'
import { resolveCssVar } from './colors'
import type { AxisConfig, LineStyle } from '../types'

export const CHART_DEFAULT_LINE_WIDTH = 0.5

export interface ResolvedAxisStyles {
  mutedFgColor:  string
  borderColor:   string
  resolvedGrid:  uPlot.Axis.Grid
  resolvedTicks: uPlot.Axis.Ticks
  axisLineStyle: LineStyle | false | undefined
}

/**
 * Resolves CSS theme variables and gridStyle/axisStyle into concrete uPlot
 * axis config objects. Call this inside getOptions() in any canvas component.
 *
 * CSS variable fallbacks work with both shadcn/ui themes and plain setups.
 */
export function resolveAxisStyles(
  gridStyle: LineStyle | false | undefined,
  axisStyle: AxisConfig | false | undefined,
): ResolvedAxisStyles {
  const mutedFgColor = resolveCssVar('--chartkit-muted-foreground', '#737373')
  const borderColor  = resolveCssVar('--chartkit-border',           '#e5e7eb')
  const w = CHART_DEFAULT_LINE_WIDTH

  const resolvedGrid: uPlot.Axis.Grid =
    gridStyle === false
      ? { show: false }
      : {
          stroke: gridStyle?.stroke ?? borderColor,
          width:  gridStyle?.width  ?? w,
          dash:   gridStyle?.dash,
        }

  const tickConfig = axisStyle === false ? false : (axisStyle?.ticks ?? undefined)
  const resolvedTicks: uPlot.Axis.Ticks =
    tickConfig === false
      ? { show: false }
      : {
          stroke: tickConfig?.stroke ?? borderColor,
          width:  tickConfig?.width  ?? w,
          dash:   tickConfig?.dash,
        }

  const axisLineStyle: LineStyle | false | undefined =
    axisStyle === false ? false : axisStyle?.line

  return { mutedFgColor, borderColor, resolvedGrid, resolvedTicks, axisLineStyle }
}
