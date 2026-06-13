import { useRef } from 'react'
import { ChartError, ChartLoader } from '../core'
import { HistogramCanvas } from './components/HistogramCanvas'
import { useBins } from './hooks/useBins'
import type { HistogramProps } from './types'

export function HistogramChart({
  values,
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
  isLoading,
  error,
}: HistogramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { edges, counts } = useBins(values, bins)

  // Convert raw counts → percentage (0–100) when normalize=true.
  // The conversion happens here so HistogramCanvas stays unaware of normalize logic.
  const n = values.length
  const displayCounts = normalize && n > 0
    ? counts.map(c => (c / n) * 100)
    : counts

  if (error) return <ChartError message={error.message} height={height} />

  if (!values.length && !isLoading) {
    return (
      <div style={{
        height,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '0.875rem',
        color:          'var(--chartkit-muted-foreground, #737373)',
      }}>
        No data
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {isLoading && <ChartLoader />}
      <div ref={containerRef} style={{ width: '100%' }} />
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
        />
      )}
    </div>
  )
}
