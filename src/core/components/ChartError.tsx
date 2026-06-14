interface ChartErrorProps {
  message: string
  height?: number
}

export function ChartError({ message, height }: ChartErrorProps) {
  return (
    <div style={{
      height: height ?? '100%',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       '0.875rem',
      color:          'var(--chartkit-destructive, #ef4444)',
    }}>
      {message}
    </div>
  )
}
