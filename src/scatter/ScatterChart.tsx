import { useRef } from 'react'
import { ChartError, ChartLoader } from '../core'
import { ScatterCanvas } from './components/ScatterCanvas'
import type { ScatterChartProps } from './types'

export function ScatterChart({
  series,
  height    = 300,
  xUnit,
  yUnit,
  gridStyle,
  axisStyle,
  isLoading,
  error,
}: ScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (error) return <ChartError message={error.message} height={height} />

  const isEmpty = series.every(s => s.xs.length === 0)
  if (isEmpty && !isLoading) {
    return (
      <div style={{
        height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', color: 'var(--muted-foreground, #737373)',
      }}>
        No data
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {isLoading && <ChartLoader />}
      <div ref={containerRef} style={{ width: '100%' }} />
      <ScatterCanvas
        containerRef={containerRef}
        series={series}
        height={height}
        xUnit={xUnit}
        yUnit={yUnit}
        gridStyle={gridStyle}
        axisStyle={axisStyle}
      />
    </div>
  )
}
