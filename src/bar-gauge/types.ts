import type React from 'react'
import type { BaseChartProps, Threshold } from '../core'

export interface BarGaugeItem {
  id: string
  label: string
  value: number | null
  min?: number
  max?: number
  color?: string
  thresholds?: Threshold[]
  description?: string
}

export interface BarGaugeChartProps extends Pick<BaseChartProps, 'height' | 'isLoading' | 'error' | 'formatters' | 'renderEmpty' | 'renderLoading' | 'renderError'> {
  items: readonly BarGaugeItem[]
  orientation?: 'horizontal' | 'vertical'
  valueDisplay?: 'value' | 'percent' | 'both' | 'none'
  min?: number
  max?: number
  unit?: string
  onItemClick?: (item: BarGaugeItem) => void
  renderValue?: (item: BarGaugeItem, formattedValue: string, formattedPercent: string) => React.ReactNode
}
