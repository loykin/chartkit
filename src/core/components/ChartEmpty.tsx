import type React from 'react'

export function ChartEmpty({ height, children }: { height: number | 'fill'; children?: React.ReactNode }) {
  return (
    <div style={{
      height: height === 'fill' ? '100%' : height,
      display: 'grid',
      placeItems: 'center',
      color: 'var(--chartkit-muted-foreground, #737373)',
    }}>
      {children ?? 'No data'}
    </div>
  )
}
