import type { BaseChartProps, LineStyle, AxisConfig } from '../core'

export interface BoxStats {
  min:        number
  q1:         number
  median:     number
  q3:         number
  max:        number
  /** Values outside the whiskers rendered as individual dots */
  outliers?:  number[]
}

export interface BoxSeriesConfig {
  label: string
  color: string
  /** One BoxStats entry per category */
  data:  BoxStats[]
}

export interface BoxPlotChartProps extends BaseChartProps {
  /** Category labels shown on the x axis */
  categories: string[]
  series:     BoxSeriesConfig[]
  /** Unit label shown on the y axis */
  yUnit?:     string
  gridStyle?: LineStyle | false
  axisStyle?: AxisConfig | false
}
