import { Loader2 } from 'lucide-react'

export function ChartLoader() {
  return (
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
  )
}
