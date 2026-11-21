import type { BaseChartProps } from '../core'
import type { ChartDatumEvent } from '../core'

export interface ScatterSeriesConfig {
  /** Stable identity used by runtime events. */
  id?:         string
  label:      string
  color:      string
  /** x values — each entry pairs with the corresponding ys entry */
  xs:         number[]
  /** y values */
  ys:         number[]
  /** Point radius in CSS px (default 4) */
  pointSize?: number
}

export interface ScatterChartProps extends BaseChartProps {
  series: ScatterSeriesConfig[]
  /** Unit label shown on the x axis */
  xUnit?: string
  /** Unit label shown on the y axis */
  yUnit?: string
  onDatumClick?: (event: ChartDatumEvent<number>) => void
  onDatumHover?: (event: ChartDatumEvent<number> | null) => void
}
