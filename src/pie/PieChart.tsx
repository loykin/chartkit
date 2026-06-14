import { ChartError, ChartLoader } from '../core'
import { PieCanvas } from './components/PieCanvas'
import type { PieChartProps } from './types'
import { formatNum } from '../core'

export function PieChart({
  slices,
  height         = 300,
  innerRadius    = 0,
  labelType      = 'percent',
  labelPosition  = 'inside',
  centerLabel,
  legendPosition = 'right',
  unit,
  isLoading,
  error,
}: PieChartProps) {
  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height} />

  if (!slices.length && !isLoading) {
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

  const total = slices.reduce((s, d) => s + d.value, 0)

  const legend = legendPosition !== 'none' && (
    <div style={{
      display:        'flex',
      flexDirection:  legendPosition === 'right' ? 'column' : 'row',
      flexWrap:       'wrap',
      gap:            '6px 12px',
      padding:        legendPosition === 'right' ? '4px 0' : '8px 0 0',
      fontSize:       12,
      alignSelf:      'center',
      minWidth:       legendPosition === 'right' ? 120 : undefined,
    }}>
      {slices.map((s) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            display:      'inline-block',
            width:        10,
            height:       10,
            borderRadius: 2,
            background:   s.color,
            flexShrink:   0,
          }} />
          <span style={{
            color:        'var(--chartkit-foreground, #111)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {s.label}
          </span>
          <span style={{ color: 'var(--chartkit-muted-foreground, #737373)', marginLeft: 'auto', paddingLeft: 8, flexShrink: 0 }}>
            {total > 0 ? `${((s.value / total) * 100).toFixed(1)}%` : '—'}
          </span>
          {unit && (
            <span style={{ color: 'var(--chartkit-muted-foreground, #737373)', flexShrink: 0 }}>
              {formatNum(s.value, unit)}
            </span>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div style={{
      position:      'relative',
      display:       'flex',
      flexDirection: legendPosition === 'right' ? 'row' : 'column',
      gap:           legendPosition === 'right' ? 16 : 0,
      width:         '100%',
      minWidth:      0,
      height:        height === 'fill' ? '100%' : undefined,
    }}>
      {isLoading && <ChartLoader />}

      <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <PieCanvas
          slices={slices}
          height={height}
          innerRadius={innerRadius}
          labelType={labelType}
          labelPosition={labelPosition}
          centerLabel={centerLabel}
          unit={unit}
        />
      </div>

      {legend}
    </div>
  )
}
