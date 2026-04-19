import { useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
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

  if (error) {
    return (
      <div style={{
        height,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '0.875rem',
        color:          'var(--destructive, #ef4444)',
      }}>
        {error.message}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {isLoading && (
        <div style={{
          position:        'absolute',
          inset:           0,
          zIndex:          20,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          borderRadius:    4,
          backgroundColor: 'color-mix(in srgb, var(--background, #ffffff) 60%, transparent)',
          backdropFilter:  'blur(4px)',
        }}>
          <Loader2
            className="ck-spin"
            style={{ width: 24, height: 24, color: 'var(--muted-foreground, #737373)' }}
          />
        </div>
      )}
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
