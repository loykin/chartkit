import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ChartKitProvider, useChartKitDefaults } from '../core/runtime/ChartKitProvider'

function DefaultsProbe() {
  const { formatters, renderTooltip } = useChartKitDefaults()
  return (
    <span>
      {formatters.value?.(42, { chartType: 'stat', purpose: 'label' })}
      {'|'}
      {formatters.label?.('cpu', { chartType: 'stat', purpose: 'label' })}
      {'|'}
      {renderTooltip ? 'tooltip' : 'default'}
    </span>
  )
}

describe('ChartKitProvider defaults', () => {
  it('provides formatter and tooltip defaults directly', () => {
    const html = renderToStaticMarkup(
      <ChartKitProvider
        formatters={{ value: value => `formatted:${value}` }}
        renderTooltip={() => 'custom'}
      >
        <DefaultsProbe />
      </ChartKitProvider>,
    )

    expect(html).toContain('formatted:42||tooltip')
  })

  it('lets a nearer provider override only specified defaults', () => {
    const html = renderToStaticMarkup(
      <ChartKitProvider formatters={{ label: value => value.toUpperCase() }}>
        <ChartKitProvider formatters={{ value: value => String(value) }}>
          <DefaultsProbe />
        </ChartKitProvider>
      </ChartKitProvider>,
    )

    expect(html).toContain('42|CPU|default')
  })
})
