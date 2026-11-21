import { useCallback, useRef, useState } from 'react'
import type uPlot from 'uplot'
import { ChartEmpty, ChartError, ChartLoader, DefaultChartTooltip, useChartFormatters, useChartKit } from '../core'
import type { SelectionResult } from '../core'
import { CandlestickCanvas } from './components/CandlestickCanvas'
import type { CandlestickChartProps, CandlestickDataPoint, CandlestickTooltipPayload } from './types'

function defaultFormatValue(value: number, locale?: string): string {
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
  tooltip = true,
  formatters: formatterOverrides,
  yMin,
  yMax,
  gridStyle,
  axisStyle,
  isLoading,
  error,
  renderEmpty,
  renderLoading,
  renderError,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const formatters = useChartFormatters(formatterOverrides)
  const { renderTooltip: renderPluginTooltip } = useChartKit()
  const [activeCandle, setActiveCandle] = useState<CandlestickDataPoint | null>(null)
  const [tooltipPayload, setTooltipPayload] = useState<CandlestickTooltipPayload | null>(null)
  const renderTooltipRef = useRef(renderTooltip)
  renderTooltipRef.current = renderTooltip

  const handleCursorMove = useCallback((chart: uPlot, idx: number | null) => {
    const candle = idx === null ? null : (data[idx] ?? null)
    setActiveCandle(candle)

    const left = chart.cursor.left ?? -1
    const top = chart.cursor.top ?? -1
    if (!candle || left < 0 || idx === null) {
      setTooltipPayload(null)
      return
    }
    setTooltipPayload({
      candle,
      datumIndex: idx,
      x: left + (chart.over.offsetLeft ?? 0),
      y: top + (chart.over.offsetTop ?? 0),
    })
  }, [data])

  const handleSelect = useCallback((result: SelectionResult) => {
    if (result.xRange) onTimeRangeChange?.(result.xRange)
    onSelect?.({ timeRange: result.xRange, yRange: result.yRange })
  }, [onSelect, onTimeRangeChange])

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>

  if (!data.length && !isLoading) {
    return <ChartEmpty height={height}>{renderEmpty?.()}</ChartEmpty>
  }

  const current = activeCandle ?? data[data.length - 1]
  const unit = yUnit ? ` ${yUnit}` : ''

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0, height: height === 'fill' ? '100%' : undefined, display: 'flex', flexDirection: 'column' }}>
      {showLegend && current && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', minHeight: 24, alignItems: 'center', fontSize: '0.75rem', color: 'var(--chartkit-muted-foreground, #737373)' }}>
          <span>{formatters.time?.(current.time, {
            chartType: 'candlestick', purpose: 'legend', axis: 'x', locale,
          }) ?? new Date(current.time * 1000).toLocaleString(locale)}</span>
          {(['open', 'high', 'low', 'close'] as const).map(key => (
            <span key={key}><strong style={{ color: 'var(--chartkit-foreground, #171717)', textTransform: 'uppercase' }}>{key[0]}</strong> {formatters.value?.(current[key], {
              chartType: 'candlestick', purpose: 'legend', seriesId: key, seriesLabel: key, unit: yUnit, locale,
            }) ?? `${defaultFormatValue(current[key], locale)}${unit}`}</span>
          ))}
          {current.volume != null && <span><strong style={{ color: 'var(--chartkit-foreground, #171717)' }}>V</strong> {formatters.value?.(current.volume, {
            chartType: 'candlestick', purpose: 'legend', seriesId: 'volume', seriesLabel: 'volume', locale,
          }) ?? defaultFormatValue(current.volume, locale)}</span>}
        </div>
      )}
      <div style={{ position: 'relative', minWidth: 0, minHeight: 0, flex: 1 }}>
        {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
        <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
        {tooltip && tooltipPayload && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'visible' }}>
            {renderTooltipRef.current
              ? renderTooltipRef.current(tooltipPayload)
              : (() => {
                  const entries = ([
                    ['open', tooltipPayload.candle.open],
                    ['high', tooltipPayload.candle.high],
                    ['low', tooltipPayload.candle.low],
                    ['close', tooltipPayload.candle.close],
                    ...(tooltipPayload.candle.volume == null ? [] : [['volume', tooltipPayload.candle.volume] as const]),
                  ] as const)
                  const payload = {
                    chartType: 'candlestick' as const,
                    x: tooltipPayload.x,
                    y: tooltipPayload.y,
                    datumIndex: tooltipPayload.datumIndex,
                    xValue: tooltipPayload.candle.time,
                    formattedXValue: formatters.time?.(tooltipPayload.candle.time, {
                      chartType: 'candlestick', purpose: 'tooltip', axis: 'x', locale,
                    }) ?? new Date(tooltipPayload.candle.time * 1000).toLocaleString(locale),
                    items: entries.map(([key, value], itemIndex) => ({
                      id: key,
                      itemIndex,
                      label: formatters.label?.(key, {
                        chartType: 'candlestick', purpose: 'tooltip', seriesId: key, seriesLabel: key,
                      }) ?? key.toUpperCase(),
                      value,
                      formattedValue: formatters.value?.(value, {
                        chartType: 'candlestick', purpose: 'tooltip', seriesId: key,
                        seriesLabel: key, unit: key === 'volume' ? undefined : yUnit, locale,
                      }) ?? `${defaultFormatValue(value, locale)}${key === 'volume' ? '' : unit}`,
                    })),
                  }
                  return renderPluginTooltip
                    ? renderPluginTooltip(payload)
                    : <DefaultChartTooltip {...payload} />
                })()}
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
          formatters={formatters}
        />
      </div>
    </div>
  )
}
