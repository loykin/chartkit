import type React from 'react'

interface ChartErrorProps {
  message?: string
  height?: number
  children?: React.ReactNode
}

export function ChartError({ message, height, children }: ChartErrorProps) {
  return (
    <div style={{
      height: height ?? '100%',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       '0.875rem',
      color:          'var(--chartkit-destructive, #ef4444)',
    }}>
      {children ?? message}
    </div>
  )
}
