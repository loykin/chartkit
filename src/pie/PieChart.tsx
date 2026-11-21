import { useRef, useState } from 'react'
import { ChartError, ChartLoader, useChartFormatters, useChartKit } from '../core'
import { PieCanvas } from './components/PieCanvas'
import type { PieChartProps, PieSliceConfig } from './types'
import { formatNum } from '../core'
import { filterHiddenSliceIds, updateHiddenSliceIds } from './utils/visibility'
import { normalizePieValue, sumPieValues } from './utils/values'

export function PieChart({
  slices,
  height         = 300,
  innerRadius    = 0,
  labelType      = 'percent',
  labelPosition  = 'inside',
  centerLabel,
  legendPosition = 'right',
  unit,
  formatters: formatterOverrides,
  renderTooltip,
  tooltip        = true,
  hiddenSliceIds,
  onHiddenSliceIdsChange,
  onSliceClick,
  onSliceHover,
  onLegendItemClick,
  renderLegend,
  isLoading,
  error,
}: PieChartProps) {
  const formatters = useChartFormatters(formatterOverrides)
  const { renderTooltip: renderPluginTooltip } = useChartKit()
  const [internalHiddenIds, setInternalHiddenIds] = useState<string[]>([])
  const [hiddenIndexes, setHiddenIndexes] = useState<Set<number>>(() => new Set())

  const isControlled = hiddenSliceIds !== undefined
  const resolvedHiddenIds = filterHiddenSliceIds(
    slices,
    isControlled ? hiddenSliceIds : internalHiddenIds,
  )
  const hiddenIdSet = new Set(resolvedHiddenIds)
  const hiddenIdsRef = useRef(resolvedHiddenIds)
  hiddenIdsRef.current = resolvedHiddenIds
  const isSliceHidden = (slice: PieSliceConfig, index: number) =>
    slice.id ? hiddenIdSet.has(slice.id) : hiddenIndexes.has(index)
  const visibleEntries = slices
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice, index }) => !isSliceHidden(slice, index))
  const visibleSlices = visibleEntries.map(entry => entry.slice)
  const visibleTotal = sumPieValues(visibleSlices)
  const legendItems = slices.map((slice, index) => ({
    slice,
    sliceIndex: index,
    percentage: !isSliceHidden(slice, index) && visibleTotal > 0
      ? (normalizePieValue(slice.value) / visibleTotal) * 100
      : 0,
    visible: !isSliceHidden(slice, index),
  }))

  const toggleSlice = (slice: PieSliceConfig, index: number) => {
    const hidden = slice.id ? hiddenIdsRef.current.includes(slice.id) : hiddenIndexes.has(index)
    onLegendItemClick?.({ slice, sliceIndex: index, hidden: !hidden })

    if (slice.id) {
      const next = updateHiddenSliceIds(hiddenIdsRef.current, slice.id, hidden)
      hiddenIdsRef.current = next
      if (!isControlled) setInternalHiddenIds(next)
      onHiddenSliceIdsChange?.(next)
      return
    }

    setHiddenIndexes(previous => {
      const next = new Set(previous)
      if (hidden) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height} />

  if (!slices.length && !isLoading) {
    return (
      <div style={{
        height: height === 'fill' ? '100%' : height,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '0.875rem',
        color:          'var(--chartkit-muted-foreground, #737373)',
      }}>
        No data
      </div>
    )
  }

  const customLegend = renderLegend
    ? renderLegend(legendItems, index => {
        const slice = slices[index]
        if (slice) toggleSlice(slice, index)
      })
    : null

  const legend = !renderLegend && legendPosition !== 'none' && (
    <div style={{
      display:        'flex',
      flexDirection:  legendPosition === 'right' ? 'column' : 'row',
      flexWrap:       'wrap',
      gap:            '6px 12px',
      padding:        legendPosition === 'right' ? '4px 0' : '8px 0 0',
      fontSize:       12,
      alignSelf:      'center',
      minWidth:       legendPosition === 'right' ? 120 : undefined,
    }}>
      {slices.map((s, index) => (
        <button
          key={s.id ?? `${s.label}-${index}`}
          type="button"
          className="ck-legend-btn"
          aria-pressed={!isSliceHidden(s, index)}
          onClick={() => toggleSlice(s, index)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, minWidth: 0,
            opacity: isSliceHidden(s, index) ? 0.35 : 1,
            padding: '2px 4px',
          }}
        >
          <span style={{
            display:      'inline-block',
            width:        10,
            height:       10,
            borderRadius: 2,
            background:   s.color,
            flexShrink:   0,
          }} />
          <span style={{
            color:        'var(--chartkit-foreground, #111)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {formatters.label?.(s.label, {
              chartType: 'pie', purpose: 'legend', seriesLabel: s.label,
            }) ?? s.label}
          </span>
          <span style={{ color: 'var(--chartkit-muted-foreground, #737373)', marginLeft: 'auto', paddingLeft: 8, flexShrink: 0 }}>
            {!isSliceHidden(s, index) && visibleTotal > 0
              ? formatters.percentage?.((normalizePieValue(s.value) / visibleTotal) * 100, {
                  chartType: 'pie', purpose: 'legend', seriesLabel: s.label, unit: '%',
                }) ?? `${((normalizePieValue(s.value) / visibleTotal) * 100).toFixed(1)}%`
              : '—'}
          </span>
          {unit && (
            <span style={{ color: 'var(--chartkit-muted-foreground, #737373)', flexShrink: 0 }}>
              {formatters.value?.(s.value, {
                chartType: 'pie', purpose: 'legend', seriesLabel: s.label, unit,
              }) ?? formatNum(s.value, unit)}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{
      position:      'relative',
      display:       'flex',
      flexDirection: legendPosition === 'right' ? 'row' : 'column',
      gap:           legendPosition === 'right' ? 16 : 0,
      width:         '100%',
      minWidth:      0,
      height:        height === 'fill' ? '100%' : undefined,
    }}>
      {isLoading && <ChartLoader />}

      <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <PieCanvas
          slices={visibleSlices}
          sliceIndices={visibleEntries.map(entry => entry.index)}
          height={height}
          innerRadius={innerRadius}
          labelType={labelType}
          labelPosition={labelPosition}
          centerLabel={centerLabel}
          unit={unit}
          formatters={formatters}
          renderTooltip={renderTooltip}
          renderPluginTooltip={renderPluginTooltip}
          tooltipEnabled={tooltip}
          onSliceClick={onSliceClick}
          onSliceHover={onSliceHover}
        />
      </div>

      {customLegend}
      {legend}
    </div>
  )
}
