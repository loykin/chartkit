import { useRef } from 'react'
import { ChartError, ChartLoader } from '../core'
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
  isLoading,
  error,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height} />

  if (!categories.length && !isLoading) {
    return (
      <div style={{
        height: height === 'fill' ? '100%' : height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', color: 'var(--chartkit-muted-foreground, #737373)',
      }}>
        No data
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined }}>
      {isLoading && <ChartLoader />}
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
      />
    </div>
  )
}
