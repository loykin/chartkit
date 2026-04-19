import { ChartError, ChartLoader } from '../core'
import { GaugeCanvas } from './components/GaugeCanvas'
import type { GaugeChartProps } from './types'

export function GaugeChart({
  value,
  min         = 0,
  max         = 100,
  unit,
  label,
  thresholds  = [],
  arcWidth    = 0.18,
  height      = 200,
  isLoading,
  error,
}: GaugeChartProps) {
  if (error) return <ChartError message={error.message} height={height} />

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {isLoading && <ChartLoader />}
      <GaugeCanvas
        value={value}
        min={min}
        max={max}
        unit={unit}
        label={label}
        thresholds={thresholds}
        arcWidth={arcWidth}
        height={height}
      />
    </div>
  )
}
