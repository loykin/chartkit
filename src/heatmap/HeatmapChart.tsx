import { useMemo, useRef } from 'react'
import { ChartEmpty, ChartError, ChartLoader, useChartFormatters } from '../core'
import { HeatmapCanvas } from './components/HeatmapCanvas'
import { binHeatmap } from './utils/binData'
import type { HeatmapChartProps } from './types'

export function HeatmapChart({
  xs,
  ys,
  xBinSize,
  yBinSize,
  height     = 300,
  xTime      = true,
  locale,
  yUnit,
  palette,
  gridStyle,
  axisStyle,
  formatters: formatterOverrides,
  isLoading,
  error,
  renderEmpty,
  renderLoading,
  renderError,
}: HeatmapChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const formatters = useChartFormatters(formatterOverrides)

  const binned = useMemo(
    () => binHeatmap(xs, ys, xBinSize, yBinSize),
    [xs, ys, xBinSize, yBinSize],
  )

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>

  if (!xs.length && !isLoading) {
    return <ChartEmpty height={height}>{renderEmpty?.()}</ChartEmpty>
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined }}>
      {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
      <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
      <HeatmapCanvas
        containerRef={containerRef}
        binned={binned}
        height={height}
        xTime={xTime}
        locale={locale}
        yUnit={yUnit}
        palette={palette}
        gridStyle={gridStyle}
        axisStyle={axisStyle}
        formatters={formatters}
      />
    </div>
  )
}
