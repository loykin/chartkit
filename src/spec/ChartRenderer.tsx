import { BarChart        } from '../bar'
import { PieChart        } from '../pie'
import { ScatterChart    } from '../scatter'
import { TimeSeriesChart } from '../time-series'
import { HistogramChart  } from '../histogram'
import { BoxPlotChart    } from '../boxplot'
import { GaugeChart      } from '../gauge'
import { StatChart       } from '../stat'
import { HeatmapChart    } from '../heatmap'
import type { ChartSpec } from './types'

export interface ChartRendererProps {
  spec: ChartSpec
  isLoading?: boolean
  error?: Error | null
}

export function ChartRenderer({ spec, isLoading, error }: ChartRendererProps) {
  const runtime = { isLoading, error }

  switch (spec.type) {
    case 'bar': {
      const { type: _, ...props } = spec
      return <BarChart {...props} {...runtime} />
    }
    case 'pie': {
      const { type: _, ...props } = spec
      return <PieChart {...props} {...runtime} />
    }
    case 'scatter': {
      const { type: _, ...props } = spec
      return <ScatterChart {...props} {...runtime} />
    }
    case 'timeseries': {
      const { type: _, ...props } = spec
      return <TimeSeriesChart {...props} {...runtime} />
    }
    case 'histogram': {
      const { type: _, ...props } = spec
      return <HistogramChart {...props} {...runtime} />
    }
    case 'boxplot': {
      const { type: _, ...props } = spec
      return <BoxPlotChart {...props} {...runtime} />
    }
    case 'gauge': {
      const { type: _, ...props } = spec
      return <GaugeChart {...props} {...runtime} />
    }
    case 'stat': {
      const { type: _, ...props } = spec
      return <StatChart {...props} {...runtime} />
    }
    case 'heatmap': {
      const { type: _, ...props } = spec
      return <HeatmapChart {...props} {...runtime} />
    }
  }
}
