import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BarGaugeChart } from '../bar-gauge'
import { CHART_SPEC_SCHEMA } from '../spec'

describe('chart state render slots', () => {
  it('renders custom empty content', () => {
    const html = renderToStaticMarkup(
      <BarGaugeChart items={[]} renderEmpty={() => <span>Nothing here</span>} />,
    )

    expect(html).toContain('Nothing here')
    expect(html).not.toContain('No data')
  })

  it('renders custom loading content inside the overlay', () => {
    const html = renderToStaticMarkup(
      <BarGaugeChart items={[]} isLoading renderLoading={() => <span>Fetching</span>} />,
    )

    expect(html).toContain('Fetching')
  })

  it('passes the error to a custom renderer', () => {
    const error = new Error('broken')
    const html = renderToStaticMarkup(
      <BarGaugeChart items={[]} error={error} renderError={value => <span>Handled: {value.message}</span>} />,
    )

    expect(html).toContain('Handled: broken')
  })

  it('keeps runtime state renderers out of the serializable schema', () => {
    const schema = JSON.stringify(CHART_SPEC_SCHEMA)

    expect(schema).not.toContain('renderEmpty')
    expect(schema).not.toContain('renderLoading')
    expect(schema).not.toContain('renderError')
    expect(schema).not.toContain('onDatumClick')
    expect(schema).not.toContain('onDatumHover')
  })
})
