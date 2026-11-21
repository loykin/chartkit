import { useRef } from 'react'
import { ChartEmpty, ChartError, ChartLoader, useChartFormatters } from '../core'
import { ScatterCanvas } from './components/ScatterCanvas'
import type { ScatterChartProps } from './types'

export function ScatterChart({
  series,
  height     = 300,
  xUnit,
  yUnit,
  gridStyle,
  axisStyle,
  formatters: formatterOverrides,
  isLoading,
  error,
  renderEmpty,
  renderLoading,
  renderError,
}: ScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const formatters = useChartFormatters(formatterOverrides)

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>

  const isEmpty = series.every(s => s.xs.length === 0)
  if (isEmpty && !isLoading) {
    return <ChartEmpty height={height}>{renderEmpty?.()}</ChartEmpty>
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined }}>
      {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
      <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
      <ScatterCanvas
        containerRef={containerRef}
        series={series}
        height={height}
        xUnit={xUnit}
        yUnit={yUnit}
        gridStyle={gridStyle}
        axisStyle={axisStyle}
        formatters={formatters}
      />
    </div>
  )
}
