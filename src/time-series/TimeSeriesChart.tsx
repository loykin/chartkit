import { useCallback, useRef, useState } from 'react'
import type uPlot from 'uplot'
import { Loader2 } from 'lucide-react'
import { ChartCanvas } from './components/ChartCanvas'
import { ChartLegend } from './components/ChartLegend'
import { useLegendState } from './hooks/useLegendState'
import type { SelectionResult, TimeSeriesChartProps, TooltipPayload } from './types'

export function TimeSeriesChart({
  data,
  series,
  height         = 300,
  legendPosition = 'bottom',
  legendFormat   = 'list',
  yUnit,
  yUnitDisplay,
  yMin,
  yMax,
  yUnit2,
  y2Min,
  y2Max,
  xShowDate,
  locale,
  gridStyle,
  axisStyle,
  barStack,
  renderLegend,
  renderTooltip,
  selectionMode  = 'x',
  onSelect,
  timeRange,
  onTimeRangeChange,
  isLoading,
  error,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { items, setChart, toggle, updateValues } = useLegendState(series, data)

  // Stable ref so renderTooltip changes never recreate the chart
  const renderTooltipRef = useRef(renderTooltip)
  renderTooltipRef.current = renderTooltip

  const [tooltipPayload, setTooltipPayload] = useState<Omit<TooltipPayload, 'items'> | null>(null)

  const handleReady = useCallback((chart: uPlot) => {
    setChart(chart)
  }, [setChart])

  const handleCursorMove = useCallback((chart: uPlot, idx: number | null) => {
    updateValues(chart, idx)

    const left = chart.cursor.left ?? -1
    const top  = chart.cursor.top  ?? -1

    if (left < 0 || idx === null) {
      setTooltipPayload(null)
      return
    }

    // Offset cursor position from plot area (u.over) to full wrapper (u.wrap)
    const x         = left + (chart.over.offsetLeft ?? 0)
    const y         = top  + (chart.over.offsetTop  ?? 0)
    const timestamp = (chart.data[0]?.[idx] as number) ?? null
    setTooltipPayload({ x, y, timestamp })
  }, [updateValues])

  // Bridge generic SelectionResult → time-series API
  const handleSelect = useCallback((result: SelectionResult) => {
    if (result.xRange) onTimeRangeChange?.(result.xRange)
    onSelect?.({ timeRange: result.xRange, yRange: result.yRange })
  }, [onSelect, onTimeRangeChange])

  if (error) {
    return (
      <div style={{
        height,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '0.875rem',
        color:          'var(--destructive, #ef4444)',
      }}>
        {error.message}
      </div>
    )
  }

  // Custom renderer takes priority over built-in legend
  const customLegend = renderLegend ? renderLegend(items) : null
  const showLegend   = !renderLegend && legendPosition !== 'none' && series.length > 0
  const isVertical   = legendPosition === 'left' || legendPosition === 'right'

  const legend = showLegend ? (
    <ChartLegend
      items={items}
      position={legendPosition}
      format={legendFormat}
      onToggle={toggle}
    />
  ) : null

  return (
    <div
      style={{
        position:      'relative',
        width:         '100%',
        minWidth:      0,
        display:       'flex',
        flexDirection: isVertical ? 'row' : 'column',
        alignItems:    isVertical ? 'flex-start' : 'stretch',
        gap:           isVertical ? 8 : 4,
      }}
    >
      {/* custom legend — rendered above canvas by default */}
      {customLegend}

      {/* top / left — renders before the canvas */}
      {(legendPosition === 'top' || legendPosition === 'left') && legend}

      {/* Chart canvas */}
      <div style={{ position: 'relative', minWidth: 0, flex: 1 }}>
        {isLoading && (
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
        )}
        <div ref={containerRef} style={{ width: '100%' }} />
        {/* Custom tooltip overlay — rendered inside position:relative wrapper */}
        {renderTooltipRef.current && tooltipPayload && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'visible' }}>
            {renderTooltipRef.current({ items, ...tooltipPayload })}
          </div>
        )}

        <ChartCanvas
          containerRef={containerRef}
          data={data}
          series={series}
          height={height}
          selectionMode={selectionMode}
          yUnit={yUnit}
          yUnitDisplay={yUnitDisplay}
          yMin={yMin}
          yMax={yMax}
          yUnit2={yUnit2}
          y2Min={y2Min}
          y2Max={y2Max}
          xShowDate={xShowDate}
          locale={locale}
          gridStyle={gridStyle}
          axisStyle={axisStyle}
          barStack={barStack}
          timeRange={timeRange}
          onSelect={handleSelect}
          onReady={handleReady}
          onCursorMove={handleCursorMove}
        />
      </div>

      {/* bottom / right — renders after the canvas */}
      {(legendPosition === 'bottom' || legendPosition === 'right') && legend}
    </div>
  )
}
