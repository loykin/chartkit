import type { LegendItem } from '../hooks/useLegendState'
import type { LegendFormat, LegendPosition } from '../types'

interface ChartLegendProps {
  items:    LegendItem[]
  position: LegendPosition
  format:   LegendFormat
  onToggle: (index: number) => void
}

function fmt(value: number | null, unit?: string, decimals = 2): string {
  if (value == null) return '—'
  const s = Math.abs(value) >= 1000
    ? value.toLocaleString(undefined, { maximumFractionDigits: 1 })
    : value.toLocaleString(undefined, { maximumFractionDigits: decimals })
  return unit ? `${s} ${unit}` : s
}

// ─── List format ─────────────────────────────────────────────────────────────

function ListLegend({ items, position, onToggle }: Omit<ChartLegendProps, 'format'>) {
  const isVertical = position === 'left' || position === 'right'

  return (
    <div
      style={{
        display:        'flex',
        gap:            4,
        fontSize:       '0.75rem',
        userSelect:     'none',
        flexDirection:  isVertical ? 'column' : 'row',
        flexWrap:       isVertical ? undefined : 'wrap',
        alignItems:     isVertical ? undefined : 'center',
        padding:        isVertical ? '4px 0' : '4px',
      }}
    >
      {items.map((item) => (
        <button
          key={item.index}
          type="button"
          onClick={() => onToggle(item.index)}
          className="ck-legend-btn"
          style={{
            gap:     6,
            padding: '2px 6px',
            opacity: item.visible ? 1 : 0.35,
          }}
        >
          <Swatch color={item.color} />
          <span style={{ fontWeight: 500, color: 'var(--foreground, #0a0a0a)' }}>
            {item.label}
          </span>
          {item.value != null && (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted-foreground, #737373)' }}>
              {fmt(item.value, item.unit)}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Table format ─────────────────────────────────────────────────────────────

const TABLE_COLS = ['Min', 'Max', 'Avg', 'Last'] as const

function TableLegend({ items, onToggle }: Omit<ChartLegendProps, 'format' | 'position'>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', userSelect: 'none' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border, #e5e7eb)', color: 'var(--muted-foreground, #737373)' }}>
            <th style={{ padding: '4px 16px 4px 0', textAlign: 'left', fontWeight: 500 }}>Name</th>
            {TABLE_COLS.map((col) => (
              <th key={col} style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 500, width: 80 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.index}
              onClick={() => onToggle(item.index)}
              className="ck-legend-row"
              style={{
                opacity:      item.visible ? 1 : 0.35,
                borderBottom: '1px solid color-mix(in srgb, var(--border, #e5e7eb) 50%, transparent)',
              }}
            >
              <td style={{ padding: '4px 16px 4px 0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Swatch color={item.color} />
                  <span style={{ fontWeight: 500, color: 'var(--foreground, #0a0a0a)' }}>
                    {item.label}
                  </span>
                </span>
              </td>
              <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--muted-foreground, #737373)' }}>
                {fmt(item.stats.min, item.unit)}
              </td>
              <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--muted-foreground, #737373)' }}>
                {fmt(item.stats.max, item.unit)}
              </td>
              <td style={{ padding: '4px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--muted-foreground, #737373)' }}>
                {fmt(item.stats.avg, item.unit)}
              </td>
              <td style={{
                padding:           '4px 8px',
                textAlign:         'right',
                fontVariantNumeric: 'tabular-nums',
                fontWeight:        500,
                color:             item.value != null
                  ? 'var(--foreground, #0a0a0a)'
                  : 'var(--muted-foreground, #737373)',
              }}>
                {/* Show cursor value while hovering, fall back to last data point */}
                {fmt(item.value ?? item.stats.last, item.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Swatch ───────────────────────────────────────────────────────────────────

function Swatch({ color }: { color: string }) {
  return (
    <span
      style={{
        display:         'inline-block',
        flexShrink:      0,
        borderRadius:    2,
        width:           10,
        height:          10,
        backgroundColor: color,
      }}
    />
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function ChartLegend({ items, position, format, onToggle }: ChartLegendProps) {
  if (format === 'table') {
    return <TableLegend items={items} onToggle={onToggle} />
  }
  return <ListLegend items={items} position={position} onToggle={onToggle} />
}
