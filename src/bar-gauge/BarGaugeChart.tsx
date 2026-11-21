import { ChartError, ChartLoader, formatNum, resolveThresholdColor, useChartFormatters } from '../core'
import { getBarGaugeGeometry } from './utils'
import type { BarGaugeChartProps, BarGaugeItem } from './types'

function ItemContainer({ item, onItemClick, children }: {
  item: BarGaugeItem
  onItemClick?: (item: BarGaugeItem) => void
  children: React.ReactNode
}) {
  if (!onItemClick) return <div style={{ minWidth: 0 }}>{children}</div>
  return <button type="button" className="ck-legend-btn" onClick={() => onItemClick(item)} style={{ display: 'block', width: '100%', height: '100%', minWidth: 0, textAlign: 'inherit', padding: 0 }}>{children}</button>
}

export function BarGaugeChart({
  items, orientation = 'horizontal', valueDisplay = 'value', min = 0, max = 100,
  unit, height = 300, formatters: formatterOverrides, onItemClick, renderValue,
  isLoading, error,
}: BarGaugeChartProps) {
  const formatters = useChartFormatters(formatterOverrides)
  if (error) return <ChartError message={error.message} height={height === 'fill' ? undefined : height} />
  if (!items.length && !isLoading) return <div style={{ height: height === 'fill' ? '100%' : height, display: 'grid', placeItems: 'center', color: 'var(--chartkit-muted-foreground, #737373)' }}>No data</div>

  const vertical = orientation === 'vertical'
  return (
    <div style={{ position: 'relative', height: height === 'fill' ? '100%' : height, display: 'grid', gridTemplateColumns: vertical ? `repeat(${items.length}, minmax(96px, 1fr))` : undefined, gap: 12, alignItems: 'stretch', overflow: 'auto' }}>
      {isLoading && <ChartLoader />}
      {items.map(item => {
        const geometry = getBarGaugeGeometry(item, min, max)
        const color = item.color ?? (geometry.value == null
          ? '#6388f2'
          : resolveThresholdColor(geometry.value, item.thresholds ?? [], '#6388f2'))
        const formattedValue = geometry.value == null ? '—' : formatters.value?.(geometry.value, { chartType: 'bar-gauge', purpose: 'label', seriesId: item.id, seriesLabel: item.label, unit }) ?? formatNum(geometry.value, unit)
        const formattedPercent = formatters.percentage?.(geometry.valuePercent, { chartType: 'bar-gauge', purpose: 'label', seriesId: item.id, seriesLabel: item.label, unit: '%' }) ?? `${geometry.valuePercent.toFixed(1)}%`
        const display = renderValue?.(item, formattedValue, formattedPercent) ?? (valueDisplay === 'both' ? `${formattedValue} · ${formattedPercent}` : valueDisplay === 'percent' ? formattedPercent : valueDisplay === 'value' ? formattedValue : null)
        return <ItemContainer key={item.id} item={item} onItemClick={onItemClick}>
          <div style={{ height: '100%', display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'stretch' : 'center', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, minWidth: vertical ? 0 : 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatters.label?.(item.label, { chartType: 'bar-gauge', purpose: 'label', seriesId: item.id, seriesLabel: item.label }) ?? item.label}</div>
            <div style={{ position: 'relative', flex: 1, minHeight: vertical ? 80 : 12, minWidth: vertical ? 12 : 80, borderRadius: 4, background: 'var(--chartkit-muted, #f3f4f6)', overflow: 'hidden' }}>
              <div style={vertical ? { position: 'absolute', left: 0, right: 0, bottom: `${geometry.segmentStart}%`, height: `${geometry.segmentSize}%`, background: color } : { position: 'absolute', top: 0, bottom: 0, left: `${geometry.segmentStart}%`, width: `${geometry.segmentSize}%`, background: color }} />
              <div style={vertical ? { position: 'absolute', left: 0, right: 0, bottom: `${geometry.zeroPercent}%`, borderTop: '1px solid var(--chartkit-foreground, #111)' } : { position: 'absolute', top: 0, bottom: 0, left: `${geometry.zeroPercent}%`, borderLeft: '1px solid var(--chartkit-foreground, #111)' }} />
            </div>
            {display != null && <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', minWidth: vertical ? 0 : 80, textAlign: vertical ? 'center' : 'right' }}>{display}</div>}
            {item.description && <div style={{ fontSize: 11, color: 'var(--chartkit-muted-foreground, #737373)' }}>{item.description}</div>}
          </div>
        </ItemContainer>
      })}
    </div>
  )
}
