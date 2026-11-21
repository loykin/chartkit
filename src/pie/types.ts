import type { BaseChartProps } from '../core'
import type React from 'react'

export interface PieSliceConfig {
  /** Stable identity used by runtime events and controlled state. */
  id?: string
  label: string
  value: number
  color: string
}

export type PieLabelType = 'name' | 'value' | 'percent' | 'name+percent' | 'none'

export interface PieTooltipPayload {
  slice: PieSliceConfig
  sliceIndex: number
  percentage: number
  x: number
  y: number
}

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
  /** Per-chart tooltip renderer. Overrides the provider tooltip plugin. */
  renderTooltip?: (payload: PieTooltipPayload) => React.ReactNode
  /** Show the built-in or custom tooltip. Default true. */
  tooltip?: boolean
}
