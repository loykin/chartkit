import { useRef } from 'react'
import { ChartEmpty, ChartError, ChartLoader, useChartFormatters } from '../core'
import { HistogramCanvas } from './components/HistogramCanvas'
import { useBins } from './hooks/useBins'
import type { HistogramProps } from './types'

export function HistogramChart({
  values,
  id           = 'histogram',
  bins,
  height       = 300,
  color        = '#3b82f6',
  fillOpacity  = 0.8,
  normalize    = false,
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
  onDatumClick,
  onDatumHover,
}: HistogramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const formatters = useChartFormatters(formatterOverrides)
  const { edges, counts } = useBins(values, bins)

  // Convert raw counts → percentage (0–100) when normalize=true.
  // The conversion happens here so HistogramCanvas stays unaware of normalize logic.
  const n = values.length
  const displayCounts = normalize && n > 0
    ? counts.map(c => (c / n) * 100)
    : counts

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>

  if (!values.length && !isLoading) {
    return <ChartEmpty height={height}>{renderEmpty?.()}</ChartEmpty>
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined }}>
      {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
      <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
      {edges.length > 0 && (
        <HistogramCanvas
          containerRef={containerRef}
          edges={edges}
          counts={displayCounts}
          height={height}
          color={color}
          fillOpacity={fillOpacity}
          normalize={normalize}
          xUnit={xUnit}
          yUnit={yUnit}
          yMin={yMin}
          yMax={yMax}
          gridStyle={gridStyle}
          axisStyle={axisStyle}
          formatters={formatters}
          id={id}
          onDatumClick={onDatumClick}
          onDatumHover={onDatumHover}
        />
      )}
    </div>
  )
}
