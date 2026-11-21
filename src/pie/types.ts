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

export interface PieSliceEvent {
  slice: PieSliceConfig
  sliceIndex: number
  percentage: number
  clientX: number
  clientY: number
}

export interface PieLegendItemEvent {
  slice: PieSliceConfig
  sliceIndex: number
  /** The next hidden state requested by the legend interaction. */
  hidden: boolean
}

export interface PieLegendItem {
  slice: PieSliceConfig
  sliceIndex: number
  percentage: number
  visible: boolean
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
  /** Controlled hidden slice identities. Slices without an id remain uncontrolled. */
  hiddenSliceIds?: readonly string[]
  /** Emits the next hidden ID set after a legend interaction. */
  onHiddenSliceIdsChange?: (ids: string[]) => void
  onSliceClick?: (event: PieSliceEvent) => void
  /** Fires when the pointer enters another slice and with null when it leaves the pie. */
  onSliceHover?: (event: PieSliceEvent | null) => void
  onLegendItemClick?: (event: PieLegendItemEvent) => void
  /** Runtime-only custom legend slot. */
  renderLegend?: (
    items: readonly PieLegendItem[],
    toggleSlice: (sliceIndex: number) => void,
  ) => React.ReactNode
}
