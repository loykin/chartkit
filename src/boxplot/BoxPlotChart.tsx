import { useRef } from 'react'
import { Loader2 } from 'lucide-react'
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
