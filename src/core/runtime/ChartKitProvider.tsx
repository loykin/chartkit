import { createContext, useContext, useMemo } from 'react'
import type React from 'react'
import type { ChartFormatters, ChartKitPlugin, ChartKitRuntime } from './types'

const EMPTY_RUNTIME: ChartKitRuntime = { formatters: {} }
const EMPTY_PLUGINS: readonly ChartKitPlugin[] = []
const ChartKitContext = createContext<ChartKitRuntime>(EMPTY_RUNTIME)

export interface ChartKitProviderProps {
  plugins?: readonly ChartKitPlugin[]
  children: React.ReactNode
}

export function resolveChartKitRuntime(
  parent: ChartKitRuntime,
  plugins: readonly ChartKitPlugin[],
): ChartKitRuntime {
  let formatters = parent.formatters
  let renderTooltip = parent.renderTooltip

  for (const plugin of plugins) {
    if (plugin.formatters) formatters = { ...formatters, ...plugin.formatters }
    if (plugin.tooltip?.render) renderTooltip = plugin.tooltip.render
  }

  return { formatters, renderTooltip }
}

export function ChartKitProvider({ plugins = EMPTY_PLUGINS, children }: ChartKitProviderProps) {
  const parent = useContext(ChartKitContext)

  const runtime = useMemo(
    () => resolveChartKitRuntime(parent, plugins),
    [parent, plugins],
  )

  return <ChartKitContext.Provider value={runtime}>{children}</ChartKitContext.Provider>
}

export function useChartKit(): ChartKitRuntime {
  return useContext(ChartKitContext)
}

export function useChartFormatters(overrides?: ChartFormatters): ChartFormatters {
  const { formatters } = useChartKit()
  return useMemo(
    () => overrides ? { ...formatters, ...overrides } : formatters,
    [formatters, overrides],
  )
}
