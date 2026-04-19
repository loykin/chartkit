import type { BaseChartProps } from '../core'

export interface PieSliceConfig {
  label: string
  value: number
  color: string
}

export type PieLabelType = 'name' | 'value' | 'percent' | 'name+percent' | 'none'

export interface PieChartProps extends BaseChartProps {
  slices: PieSliceConfig[]
  /**
   * Inner radius as a fraction of the outer radius (0–1).
   * 0 = solid pie, 0.5–0.7 = typical donut. Default 0.
   */
  innerRadius?: number
  /** What to print on each slice. Default 'percent' */
  labelType?: PieLabelType
  /** Where to place slice labels. Default 'inside' */
  labelPosition?: 'inside' | 'outside'
  /** Text rendered in the center hole (donut mode only) */
  centerLabel?: string
  /** Legend placement. Default 'right' */
  legendPosition?: 'right' | 'bottom' | 'none'
  /** Value unit shown in tooltip and legend, e.g. 'ms', 'req' */
  unit?: string
}
