import { ChartError, ChartLoader, useChartFormatters } from '../core'
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
  formatters: formatterOverrides,
  isLoading,
  error,
  renderLoading,
  renderError,
}: GaugeChartProps) {
  const formatters = useChartFormatters(formatterOverrides)

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined }}>
      {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
      <GaugeCanvas
        value={value}
        min={min}
        max={max}
        unit={unit}
        label={label}
        thresholds={thresholds}
        arcWidth={arcWidth}
        height={height}
        formatters={formatters}
      />
    </div>
  )
}
