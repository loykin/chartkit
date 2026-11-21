import { useRef } from 'react'
import { ChartEmpty, ChartError, ChartLoader, useChartFormatters } from '../core'
import { BarCanvas } from './components/BarCanvas'
import type { BarChartProps } from './types'

export function BarChart({
  categories,
  series,
  height      = 300,
  orientation = 'vertical',
  stacked     = false,
  xUnit,
  yUnit,
  yMin,
  yMax,
  gridStyle,
  axisStyle,
  formatters: formatterOverrides,
  isLoading,
  error,
  renderEmpty,
  renderLoading,
  renderError,
}: BarChartProps) {
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
      <BarCanvas
        containerRef={containerRef}
        categories={categories}
        series={series}
        orientation={orientation}
        stacked={stacked}
        height={height}
        xUnit={xUnit}
        yUnit={yUnit}
        yMin={yMin}
        yMax={yMax}
        gridStyle={gridStyle}
        axisStyle={axisStyle}
        formatters={formatters}
      />
    </div>
  )
}
