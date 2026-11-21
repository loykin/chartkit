import type { ChartTooltipPayload } from '../runtime'

export function DefaultChartTooltip({ items, x, y, formattedXValue }: ChartTooltipPayload) {
  const visibleItems = items.filter(item => item.value != null)
  if (!visibleItems.length) return null

  return (
    <div style={{
      position:      'absolute',
      left:          x + 12,
      top:           y - 8,
      background:    'var(--chartkit-background, #fff)',
      border:        '1px solid var(--chartkit-border, #e2e8f0)',
      borderRadius:  6,
      padding:       '6px 10px',
      fontSize:      12,
      pointerEvents: 'none',
      boxShadow:     '0 2px 8px rgba(0,0,0,0.12)',
      whiteSpace:    'nowrap',
      zIndex:        30,
    }}>
      {formattedXValue && (
        <div style={{ marginBottom: 4, color: 'var(--chartkit-muted-foreground, #737373)' }}>
          {formattedXValue}
        </div>
      )}
      {visibleItems.map(item => (
        <div key={item.id ?? item.itemIndex} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          {item.color && (
            <span style={{
              display: 'inline-block', width: 10, height: 10, borderRadius: 2,
              background: item.color, flexShrink: 0,
            }} />
          )}
          <span style={{ color: 'var(--chartkit-foreground, #111)' }}>{item.label}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--chartkit-muted-foreground, #737373)' }}>
            {item.formattedValue}
          </span>
        </div>
      ))}
    </div>
  )
}
