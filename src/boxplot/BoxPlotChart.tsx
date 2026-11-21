import { useRef } from 'react'
import { ChartEmpty, ChartError, ChartLoader, useChartFormatters } from '../core'
import { BoxPlotCanvas } from './components/BoxPlotCanvas'
import type { BoxPlotChartProps } from './types'

export function BoxPlotChart({
  categories,
  series,
  height     = 300,
  yUnit,
  gridStyle,
  axisStyle,
  formatters: formatterOverrides,
  isLoading,
  error,
  renderEmpty,
  renderLoading,
  renderError,
}: BoxPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const formatters = useChartFormatters(formatterOverrides)

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>

  if (!categories.length && !isLoading) {
    return <ChartEmpty height={height}>{renderEmpty?.()}</ChartEmpty>
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined }}>
      {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
      <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
      <BoxPlotCanvas
        containerRef={containerRef}
        categories={categories}
        series={series}
        height={height}
        yUnit={yUnit}
        gridStyle={gridStyle}
        axisStyle={axisStyle}
        formatters={formatters}
      />
    </div>
  )
}
