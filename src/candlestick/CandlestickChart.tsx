import { useCallback, useRef, useState } from 'react'
import type uPlot from 'uplot'
import { ChartError, ChartLoader } from '../core'
import type { SelectionResult } from '../core'
import { CandlestickCanvas } from './components/CandlestickCanvas'
import type { CandlestickChartProps, CandlestickDataPoint, CandlestickTooltipPayload } from './types'

function formatValue(value: number, locale?: string): string {
  return value.toLocaleString(locale, { maximumFractionDigits: 4 })
}

export function CandlestickChart({
  data,
  height = 360,
  upColor = '#22c55e',
  downColor = '#ef4444',
  candleWidth = 0.65,
  showVolume = true,
  volumeHeight = 0.2,
  yUnit,
  locale,
  showXAxis = true,
  showLegend = true,
  selectionMode = 'x',
  onSelect,
  timeRange,
  onTimeRangeChange,
  renderTooltip,
  yMin,
  yMax,
  gridStyle,
  axisStyle,
  isLoading,
  error,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCandle, setActiveCandle] = useState<CandlestickDataPoint | null>(null)
  const [tooltipPayload, setTooltipPayload] = useState<CandlestickTooltipPayload | null>(null)
  const renderTooltipRef = useRef(renderTooltip)
  renderTooltipRef.current = renderTooltip

  const handleCursorMove = useCallback((chart: uPlot, idx: number | null) => {
    const candle = idx === null ? null : (data[idx] ?? null)
    setActiveCandle(candle)

    const left = chart.cursor.left ?? -1
    const top = chart.cursor.top ?? -1
    if (!candle || left < 0) {
      setTooltipPayload(null)
      return
    }
    setTooltipPayload({
      candle,
      x: left + (chart.over.offsetLeft ?? 0),
      y: top + (chart.over.offsetTop ?? 0),
    })
  }, [data])

  const handleSelect = useCallback((result: SelectionResult) => {
    if (result.xRange) onTimeRangeChange?.(result.xRange)
    onSelect?.({ timeRange: result.xRange, yRange: result.yRange })
  }, [onSelect, onTimeRangeChange])

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height} />

  if (!data.length && !isLoading) {
    return (
      <div style={{
        height: height === 'fill' ? '100%' : height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', color: 'var(--chartkit-muted-foreground, #737373)',
      }}>
        No data
      </div>
    )
  }

  const current = activeCandle ?? data[data.length - 1]
  const unit = yUnit ? ` ${yUnit}` : ''

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined, display: 'flex', flexDirection: 'column' }}>
      {showLegend && current && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', minHeight: 24, alignItems: 'center', fontSize: '0.75rem', color: 'var(--chartkit-muted-foreground, #737373)' }}>
          <span>{new Date(current.time * 1000).toLocaleString(locale)}</span>
          {(['open', 'high', 'low', 'close'] as const).map(key => (
            <span key={key}><strong style={{ color: 'var(--chartkit-foreground, #171717)', textTransform: 'uppercase' }}>{key[0]}</strong> {formatValue(current[key], locale)}{unit}</span>
          ))}
          {current.volume != null && <span><strong style={{ color: 'var(--chartkit-foreground, #171717)' }}>V</strong> {formatValue(current.volume, locale)}</span>}
        </div>
      )}
      <div style={{ position: 'relative', minWidth: 0, minHeight: 0, flex: 1 }}>
        {isLoading && <ChartLoader />}
        <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
        {renderTooltipRef.current && tooltipPayload && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'visible' }}>
            {renderTooltipRef.current(tooltipPayload)}
          </div>
        )}
        <CandlestickCanvas
          containerRef={containerRef}
          data={data}
          height={height}
          upColor={upColor}
          downColor={downColor}
          candleWidth={Math.min(1, Math.max(0.1, candleWidth))}
          showVolume={showVolume}
          volumeHeight={Math.min(0.5, Math.max(0, volumeHeight))}
          yUnit={yUnit}
          locale={locale}
          showXAxis={showXAxis}
          yMin={yMin}
          yMax={yMax}
          gridStyle={gridStyle}
          axisStyle={axisStyle}
          selectionMode={selectionMode}
          timeRange={timeRange}
          onSelect={handleSelect}
          onCursorMove={handleCursorMove}
        />
      </div>
    </div>
  )
}
