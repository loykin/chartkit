import { createContext, useContext, useMemo } from 'react'
import type React from 'react'
import type { ChartFormatters, ChartTooltipRenderer } from './types'

interface ChartKitDefaults {
  formatters: ChartFormatters
  renderTooltip?: ChartTooltipRenderer
}

const EMPTY_DEFAULTS: ChartKitDefaults = { formatters: {} }
const ChartKitContext = createContext<ChartKitDefaults>(EMPTY_DEFAULTS)

export interface ChartKitProviderProps {
  formatters?: ChartFormatters
  renderTooltip?: ChartTooltipRenderer
  children: React.ReactNode
}

export function ChartKitProvider({ formatters, renderTooltip, children }: ChartKitProviderProps) {
  const parent = useContext(ChartKitContext)

  const defaults = useMemo<ChartKitDefaults>(
    () => ({
      formatters: formatters ? { ...parent.formatters, ...formatters } : parent.formatters,
      renderTooltip: renderTooltip ?? parent.renderTooltip,
    }),
    [parent, formatters, renderTooltip],
  )

  return <ChartKitContext.Provider value={defaults}>{children}</ChartKitContext.Provider>
}

export function useChartKitDefaults(): ChartKitDefaults {
  return useContext(ChartKitContext)
}

export function useChartFormatters(overrides?: ChartFormatters): ChartFormatters {
  const { formatters } = useChartKitDefaults()
  return useMemo(
    () => overrides ? { ...formatters, ...overrides } : formatters,
    [formatters, overrides],
  )
}
