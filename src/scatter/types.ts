import type { BaseChartProps, LineStyle, AxisConfig } from '../core'

export interface ScatterSeriesConfig {
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
  series:     ScatterSeriesConfig[]
  /** Unit label shown on the x axis */
  xUnit?:     string
  /** Unit label shown on the y axis */
  yUnit?:     string
  gridStyle?: LineStyle | false
  axisStyle?: AxisConfig | false
}
