import { describe, expect, expectTypeOf, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChartKitProvider, resolveChartKitRuntime, useChartKit } from '../core/runtime/ChartKitProvider'
import type { ChartKitRuntime, ChartTooltipRenderer } from '../core/runtime'
import { ChartRenderer } from '../spec'
import type { BarGaugeSpec, TimeSeriesSpec } from '../spec'

function FormatterProbe() {
  const { formatters } = useChartKit()
  return <span>{formatters.value?.(42, { chartType: 'stat', purpose: 'label' })}</span>
}

describe('resolveChartKitRuntime', () => {
  it('inherits parent behavior and merges formatter fields', () => {
    const value = (input: number) => String(input)
    const label = (input: string) => input.toUpperCase()
    const parent: ChartKitRuntime = { formatters: { value } }

    const runtime = resolveChartKitRuntime(parent, [
      { formatters: { label } },
    ])

    expect(runtime.formatters.value).toBe(value)
    expect(runtime.formatters.label).toBe(label)
  })

  it('lets later plugins override only the behavior they define', () => {
    const firstValue = (input: number) => `first:${input}`
    const lastValue = (input: number) => `last:${input}`
    const firstTooltip: ChartTooltipRenderer = () => 'first'
    const lastTooltip: ChartTooltipRenderer = () => 'last'

    const runtime = resolveChartKitRuntime({ formatters: {} }, [
      { formatters: { value: firstValue }, tooltip: { render: firstTooltip } },
      { formatters: { value: lastValue } },
      { tooltip: { render: lastTooltip } },
    ])

    expect(runtime.formatters.value).toBe(lastValue)
    expect(runtime.renderTooltip).toBe(lastTooltip)
  })

  it('provides merged formatter plugins through React context', () => {
    const html = renderToStaticMarkup(
      <ChartKitProvider plugins={[{ formatters: { value: value => `formatted:${value}` } }]}>
        <FormatterProbe />
      </ChartKitProvider>,
    )

    expect(html).toContain('formatted:42')
  })

  it('keeps ChartSpec height portable', () => {
    expectTypeOf<TimeSeriesSpec['height']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<BarGaugeSpec['height']>().toEqualTypeOf<number | undefined>()
  })

  it('renders a bar gauge from a serializable spec', () => {
    const spec: BarGaugeSpec = {
      type: 'barGauge',
      items: [{ id: 'cpu', label: 'CPU', value: 42 }],
    }

    const html = renderToStaticMarkup(<ChartRenderer spec={spec} />)

    expect(html).toContain('CPU')
    expect(html).toContain('42')
  })
})
