import { useCallback, useRef, useState } from 'react'
import type uPlot from 'uplot'
import { ChartEmpty, ChartError, ChartLoader, DefaultChartTooltip, useChartFormatters, useChartKit } from '../core'
import { ChartCanvas } from './components/ChartCanvas'
import { ChartLegend } from './components/ChartLegend'
import { useLegendState } from './hooks/useLegendState'
import type { SelectionResult, TimeSeriesChartProps, TooltipPayload } from './types'
import { applyTooltipPolicy } from './utils/tooltipSelection'

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
  sync = false,
  hiddenSeriesIds,
  onHiddenSeriesIdsChange,
  formatters: formatterOverrides,
  gridStyle,
  axisStyle,
  barStack,
  thresholds,
  markers,
  regions,
  onMarkerClick,
  onRegionClick,
  renderLegend,
  renderTooltip,
  tooltip        = true,
  selectTooltipItems,
  selectionMode  = 'x',
  onSelect,
  timeRange,
  onTimeRangeChange,
  isLoading,
  error,
  renderEmpty,
  renderLoading,
  renderError,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const formatters = useChartFormatters(formatterOverrides)
  const { renderTooltip: renderPluginTooltip } = useChartKit()
  const { items, setChart, setSeriesVisibility, toggle, updateValues } = useLegendState(series, data, {
    hiddenSeriesIds,
    onHiddenSeriesIdsChange,
  })

  // Stable ref so renderTooltip changes never recreate the chart
  const renderTooltipRef = useRef(renderTooltip)
  renderTooltipRef.current = renderTooltip

  const [tooltipPayload, setTooltipPayload] = useState<(
    Omit<TooltipPayload, 'items'> & { datumIndex: number; nearestItemIndex?: number }
  ) | null>(null)

  const hasStackedBars = !!barStack && series.some(item => item.type === 'bars')
  const toChartSeriesIndex = useCallback(
    (index: number) => hasStackedBars ? series.length - index + 1 : index,
    [hasStackedBars, series.length],
  )

  const handleReady = useCallback((chart: uPlot) => {
    setChart(chart, toChartSeriesIndex)
  }, [setChart, toChartSeriesIndex])

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
    let nearestItemIndex: number | undefined
    let nearestDistance = Number.POSITIVE_INFINITY
    series.forEach((_, inputIndex) => {
      const chartIndex = toChartSeriesIndex(inputIndex + 1)
      if (chart.series[chartIndex]?.show === false) return
      const value = chart.data[chartIndex]?.[idx]
      const scale = chart.series[chartIndex]?.scale
      if (typeof value !== 'number' || !Number.isFinite(value) || !scale) return
      const distance = Math.abs(chart.valToPos(value, scale) - top)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestItemIndex = inputIndex
      }
    })
    setTooltipPayload({ x, y, timestamp, datumIndex: idx, nearestItemIndex })
  }, [series, toChartSeriesIndex, updateValues])

  // Bridge generic SelectionResult → time-series API
  const handleSelect = useCallback((result: SelectionResult) => {
    if (result.xRange) onTimeRangeChange?.(result.xRange)
    onSelect?.({ timeRange: result.xRange, yRange: result.yRange })
  }, [onSelect, onTimeRangeChange])

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height}>{renderError?.(error)}</ChartError>
  if (!(data[0]?.length) && !isLoading) return <ChartEmpty height={height}>{renderEmpty?.()}</ChartEmpty>

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
      formatters={formatters}
    />
  ) : null

  const tooltipPolicy = typeof tooltip === 'object' ? tooltip : {}
  const visibleTooltipItems = items.filter(item => item.visible)
  const tooltipCursor = tooltipPayload && {
    datumIndex: tooltipPayload.datumIndex,
    timestamp: tooltipPayload.timestamp,
    x: tooltipPayload.x,
    y: tooltipPayload.y,
  }
  const selectedTooltipItems = tooltipPayload && tooltipCursor
    ? selectTooltipItems
      ? applyTooltipPolicy(
          selectTooltipItems(Object.freeze([...visibleTooltipItems]), tooltipCursor),
          { maxItems: tooltipPolicy.maxItems },
        )
      : applyTooltipPolicy(visibleTooltipItems, tooltipPolicy, tooltipPayload.nearestItemIndex)
    : []

  return (
    <div
      style={{
        position:      'relative',
        width:         '100%',
        minWidth:      0,
        display:       'flex',
        flexDirection: isVertical ? 'row' : 'column',
        alignItems:    height === 'fill' ? 'stretch' : (isVertical ? 'flex-start' : 'stretch'),
        gap:           isVertical ? 8 : 4,
        height:        height === 'fill' ? '100%' : undefined,
      }}
    >
      {/* custom legend — rendered above canvas by default */}
      {customLegend}

      {/* top / left — renders before the canvas */}
      {(legendPosition === 'top' || legendPosition === 'left') && legend}

      {/* Chart canvas */}
      <div style={{ position: 'relative', minWidth: 0, minHeight: 0, flex: 1 }}>
        {isLoading && <ChartLoader>{renderLoading?.()}</ChartLoader>}
        <div ref={containerRef} style={{ width: '100%', height: height === 'fill' ? '100%' : undefined }} />
        {/* Custom tooltip overlay — rendered inside position:relative wrapper */}
        {tooltip !== false && tooltipPayload && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'visible' }}>
            {renderTooltipRef.current
              ? renderTooltipRef.current({
                  items: selectedTooltipItems,
                  timestamp: tooltipPayload.timestamp,
                  x: tooltipPayload.x,
                  y: tooltipPayload.y,
                })
              : (() => {
                  const timestamp = tooltipPayload.timestamp
                  const payload = {
                    chartType: 'timeseries' as const,
                    x: tooltipPayload.x,
                    y: tooltipPayload.y,
                    xValue: timestamp,
                    formattedXValue: timestamp == null
                      ? undefined
                      : formatters.time?.(timestamp, {
                          chartType: 'timeseries', purpose: 'tooltip', axis: 'x', locale,
                        }) ?? new Date(timestamp * 1000).toLocaleString(locale),
                    datumIndex: tooltipPayload.datumIndex,
                    items: selectedTooltipItems.map(item => ({
                      id: item.id,
                      itemIndex: item.index - 1,
                      label: formatters.label?.(item.label, {
                        chartType: 'timeseries', purpose: 'tooltip', seriesLabel: item.label,
                      }) ?? item.label,
                      color: item.color,
                      value: item.value,
                      formattedValue: item.value == null
                        ? '—'
                        : formatters.value?.(item.value, {
                            chartType: 'timeseries', purpose: 'tooltip',
                            seriesLabel: item.label, unit: item.unit,
                          }) ?? `${item.value.toLocaleString()}${item.unit ? `\u202f${item.unit}` : ''}`,
                    })),
                  }
                  return renderPluginTooltip
                    ? renderPluginTooltip(payload)
                    : <DefaultChartTooltip {...payload} />
                })()}
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
          sync={sync}
          gridStyle={gridStyle}
          axisStyle={axisStyle}
          barStack={barStack}
          thresholds={thresholds}
          markers={markers}
          regions={regions}
          formatters={formatters}
          timeRange={timeRange}
          onSelect={handleSelect}
          onReady={handleReady}
          onCursorMove={handleCursorMove}
          onSeriesVisibilityChange={setSeriesVisibility}
          onMarkerClick={onMarkerClick}
          onRegionClick={onRegionClick}
        />
      </div>

      {/* bottom / right — renders after the canvas */}
      {(legendPosition === 'bottom' || legendPosition === 'right') && legend}
    </div>
  )
}
