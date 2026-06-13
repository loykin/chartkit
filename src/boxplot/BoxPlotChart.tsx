import { useRef } from 'react'
import { ChartError, ChartLoader } from '../core'
import { BoxPlotCanvas } from './components/BoxPlotCanvas'
import type { BoxPlotChartProps } from './types'

export function BoxPlotChart({
  categories,
  series,
  height    = 300,
  yUnit,
  gridStyle,
  axisStyle,
  isLoading,
  error,
}: BoxPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (error) return <ChartError message={error.message} height={height} />

  if (!categories.length && !isLoading) {
    return (
      <div style={{
        height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', color: 'var(--chartkit-muted-foreground, #737373)',
      }}>
        No data
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {isLoading && <ChartLoader />}
      <div ref={containerRef} style={{ width: '100%' }} />
      <BoxPlotCanvas
        containerRef={containerRef}
        categories={categories}
        series={series}
        height={height}
        yUnit={yUnit}
        gridStyle={gridStyle}
        axisStyle={axisStyle}
      />
    </div>
  )
}
