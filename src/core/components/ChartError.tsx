interface ChartErrorProps {
  message: string
  height:  number
}

export function ChartError({ message, height }: ChartErrorProps) {
  return (
    <div style={{
      height,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       '0.875rem',
      color:          'var(--destructive, #ef4444)',
    }}>
      {message}
    </div>
  )
}
