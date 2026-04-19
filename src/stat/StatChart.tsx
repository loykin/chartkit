import { ChartError, ChartLoader, formatNum, resolveThresholdColor } from '../core'
import type { StatChartProps } from './types'

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function SparklineSVG({ values, color, height }: { values: number[]; color: string; height: number }) {
  const min   = Math.min(...values)
  const max   = Math.max(...values)
  const range = max - min || 1

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = height - ((v - min) / range) * (height - 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block' }}
    >
      <polygon
        points={`0,${height} ${pts} 100,${height}`}
        fill={color}
        opacity={0.15}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// ── Trend indicator ───────────────────────────────────────────────────────────

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous
  const pct   = previous !== 0 ? (delta / Math.abs(previous)) * 100 : null
  const up    = delta > 0
  const flat  = delta === 0

  const color = flat
    ? 'var(--muted-foreground, #737373)'
    : up ? '#10b981' : '#ef4444'

  const arrow = flat ? '→' : up ? '↑' : '↓'
  const label = pct != null ? `${Math.abs(pct).toFixed(1)}%` : (delta > 0 ? '+' : '') + delta.toFixed(1)

  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:        2,
      fontSize:   12,
      fontWeight: 500,
      color,
      marginTop:  4,
    }}>
      <span>{arrow}</span>
      <span>{label}</span>
    </div>
  )
}

// ── StatChart ─────────────────────────────────────────────────────────────────

export function StatChart({
  value,
  label,
  unit,
  previousValue,
  thresholds   = [],
  color,
  sparkline,
  sparklineColor,
  height       = 120,
  isLoading,
  error,
}: StatChartProps) {
  if (error) return <ChartError message={error.message} height={height} />

  const displayColor = color ?? resolveThresholdColor(value ?? 0, thresholds, '#3b82f6')
  const hasSparkline = sparkline && sparkline.length > 1
  const hasTrend     = previousValue != null && value != null

  // Scale font-size to height
  const valueFontSize = Math.max(20, Math.min(52, height * 0.34))

  return (
    <div style={{
      height,
      position:       'relative',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '10px 16px 6px',
      overflow:       'hidden',
      boxSizing:      'border-box',
    }}>
      {isLoading && <ChartLoader />}

      {label && (
        <div style={{
          fontSize:   12,
          color:      'var(--muted-foreground, #737373)',
          marginBottom: 2,
          textAlign:  'center',
        }}>
          {label}
        </div>
      )}

      <div style={{
        fontSize:   valueFontSize,
        fontWeight: 700,
        color:      displayColor,
        lineHeight: 1,
        textAlign:  'center',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value != null ? formatNum(value, unit) : '—'}
      </div>

      {hasTrend && (
        <TrendBadge current={value!} previous={previousValue!} />
      )}

      {hasSparkline && (
        <div style={{ width: '100%', marginTop: 6, opacity: 0.8 }}>
          <SparklineSVG
            values={sparkline!}
            color={sparklineColor ?? displayColor}
            height={Math.max(24, height * 0.22)}
          />
        </div>
      )}
    </div>
  )
}
