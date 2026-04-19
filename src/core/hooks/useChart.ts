import { useEffect, useRef } from 'react'
import uPlot from 'uplot'

interface UseChartOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  getOptions:   () => uPlot.Options
  data:         uPlot.AlignedData
  /** Called once after the chart is created */
  onReady?:     (chart: uPlot) => void
}

/**
 * Manages the uPlot instance lifecycle.
 *
 * - Creates the chart after mount (ResizeObserver determines initial width).
 * - Calls `uplot.setData()` when data changes (avoids full re-create).
 * - Re-creates the chart when options change (size, series config, plugins).
 * - Destroys the chart on unmount.
 */
export function useChart({ containerRef, getOptions, data, onReady }: UseChartOptions) {
  const uRef        = useRef<uPlot | null>(null)
  const dataRef     = useRef(data)
  const onReadyRef  = useRef(onReady)
  onReadyRef.current = onReady

  // Keep latest data ref without triggering re-create
  dataRef.current = data

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ro:    ResizeObserver | null = null
    let chart: uPlot | null = null

    function create(width: number) {
      if (chart) {
        chart.destroy()
        chart = null
      }
      const opts = getOptions()
      opts.width  = width
      chart       = new uPlot(opts, dataRef.current, container as HTMLElement)
      uRef.current = chart
      onReadyRef.current?.(chart)
    }

    ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? container.clientWidth
      if (!width) return

      if (!chart) {
        create(width)
      } else {
        chart.setSize({ width, height: chart.height })
      }
    })

    ro.observe(container)

    return () => {
      ro?.disconnect()
      chart?.destroy()
      uRef.current = null
    }
    // getOptions identity changes when series/mode/height change → full re-create
  }, [containerRef, getOptions])

  // Update data without re-creating the chart
  useEffect(() => {
    uRef.current?.setData(data)
  }, [data])

  return uRef
}
