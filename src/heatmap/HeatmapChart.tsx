import { useMemo, useRef } from 'react'
import { ChartError, ChartLoader } from '../core'
import { HeatmapCanvas } from './components/HeatmapCanvas'
import { binHeatmap } from './utils/binData'
import type { HeatmapChartProps } from './types'

export function HeatmapChart({
  xs,
  ys,
  xBinSize,
  yBinSize,
  height      = 300,
  xTime       = true,
  locale,
  yUnit,
  palette,
  gridStyle,
  axisStyle,
  isLoading,
  error,
}: HeatmapChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const binned = useMemo(
    () => binHeatmap(xs, ys, xBinSize, yBinSize),
    [xs, ys, xBinSize, yBinSize],
  )

  if (error) return <ChartError message={error.message} height={height} />

  if (!xs.length && !isLoading) {
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
      />
    </div>
  )
}
