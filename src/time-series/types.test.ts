import { describe, expect, expectTypeOf, it } from 'vitest'
import type { TooltipPayload } from './types'

describe('TooltipPayload', () => {
  it('exposes the original datum index', () => {
    expectTypeOf<TooltipPayload['datumIndex']>().toEqualTypeOf<number>()

    const payload: TooltipPayload = {
      items: [],
      timestamp: 1_700_000_000,
      datumIndex: 4,
      x: 120,
      y: 80,
    }

    expect(payload.datumIndex).toBe(4)
  })
})
