import type { BaseChartProps } from '../core'

export interface BarSeriesConfig {
  label:  string
  color:  string
  /** One value per category. Null = skip that bar */
  values: (number | null)[]
}

export interface BarChartProps extends BaseChartProps {
  /** Category labels shown on the axis */
  categories: string[]
  series:     BarSeriesConfig[]
  /** Stack bars instead of grouping them side by side. Default false */
  stacked?:   boolean
  /** Bar orientation. Default 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** Unit label on the category axis (vertical: x-axis, horizontal: y-axis) */
  xUnit?:     string
  /** Unit label on the value axis */
  yUnit?:     string
}
