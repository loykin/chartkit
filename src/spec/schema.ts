// "주는 정보" — AI가 ChartSpec을 생성할 수 있도록 전달하는 스키마 정의

export const CHART_SPEC_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ChartSpec',
  description: 'Declarative specification for rendering a chart with @loykin/chartkit',
  oneOf: [
    { $ref: '#/definitions/BarChartSpec'     },
    { $ref: '#/definitions/PieChartSpec'     },
    { $ref: '#/definitions/ScatterChartSpec' },
    { $ref: '#/definitions/TimeSeriesSpec'   },
    { $ref: '#/definitions/HistogramSpec'    },
    { $ref: '#/definitions/BoxPlotSpec'      },
    { $ref: '#/definitions/GaugeSpec'        },
    { $ref: '#/definitions/StatSpec'         },
    { $ref: '#/definitions/HeatmapSpec'      },
  ],
  definitions: {
    LineStyle: {
      type: 'object',
      properties: {
        width:  { type: 'number',  description: 'Line width in px' },
        stroke: { type: 'string',  description: 'CSS color string' },
        dash:   { type: 'array', items: { type: 'number' }, description: 'Dash pattern e.g. [4, 2]' },
      },
    },
    Threshold: {
      type: 'object',
      required: ['value', 'color'],
      properties: {
        value: { type: 'number' },
        color: { type: 'string', description: 'CSS color string' },
        label: { type: 'string' },
        width: { type: 'number' },
        dash:  { type: 'array', items: { type: 'number' } },
      },
    },
    BaseChartFields: {
      type: 'object',
      properties: {
        height:    { type: 'number', description: 'Canvas height in px (default 300)' },
        yMin:      { type: 'number', description: 'Y-axis minimum (default: auto)' },
        yMax:      { type: 'number', description: 'Y-axis maximum (default: auto)' },
        gridStyle: { oneOf: [{ $ref: '#/definitions/LineStyle' }, { type: 'boolean', enum: [false] }] },
      },
    },
    BarChartSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'categories', 'series'],
          properties: {
            type:        { const: 'bar' },
            categories:  { type: 'array', items: { type: 'string' }, description: 'Category labels on the axis' },
            series: {
              type: 'array',
              items: {
                type: 'object',
                required: ['label', 'color', 'values'],
                properties: {
                  label:  { type: 'string' },
                  color:  { type: 'string', description: 'CSS color string' },
                  values: { type: 'array', items: { type: ['number', 'null'] }, description: 'One value per category. null = skip that bar' },
                },
              },
            },
            stacked:     { type: 'boolean', description: 'Stack bars instead of grouping. Default false' },
            orientation: { type: 'string', enum: ['vertical', 'horizontal'], description: 'Default vertical' },
            xUnit:       { type: 'string', description: 'Unit label on the category axis' },
            yUnit:       { type: 'string', description: 'Unit label on the value axis' },
          },
        },
      ],
    },
    PieChartSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'slices'],
          properties: {
            type:   { const: 'pie' },
            slices: {
              type: 'array',
              items: {
                type: 'object',
                required: ['label', 'value', 'color'],
                properties: {
                  label: { type: 'string' },
                  value: { type: 'number' },
                  color: { type: 'string' },
                },
              },
            },
            innerRadius:    { type: 'number', minimum: 0, maximum: 1, description: '0 = solid pie, 0.5–0.7 = donut' },
            labelType:      { type: 'string', enum: ['name', 'value', 'percent', 'name+percent', 'none'] },
            labelPosition:  { type: 'string', enum: ['inside', 'outside'] },
            centerLabel:    { type: 'string', description: 'Text in the center hole (donut only)' },
            legendPosition: { type: 'string', enum: ['right', 'bottom', 'none'] },
            unit:           { type: 'string', description: 'Value unit shown in tooltip e.g. ms, req' },
          },
        },
      ],
    },
    ScatterChartSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'series'],
          properties: {
            type:   { const: 'scatter' },
            series: {
              type: 'array',
              items: {
                type: 'object',
                required: ['label', 'color', 'xs', 'ys'],
                properties: {
                  label:     { type: 'string' },
                  color:     { type: 'string' },
                  xs:        { type: 'array', items: { type: 'number' }, description: 'x values' },
                  ys:        { type: 'array', items: { type: 'number' }, description: 'y values (same length as xs)' },
                  pointSize: { type: 'number', description: 'Dot radius in px (default 4)' },
                },
              },
            },
            xUnit: { type: 'string' },
            yUnit: { type: 'string' },
          },
        },
      ],
    },
    TimeSeriesSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'data', 'series'],
          properties: {
            type: { const: 'timeseries' },
            data: {
              type: 'array',
              description: 'AlignedData: [unix_timestamps_seconds, series1_values, series2_values, ...]',
              items: { type: 'array', items: { type: ['number', 'null'] } },
            },
            series: {
              type: 'array',
              items: {
                type: 'object',
                required: ['label', 'color'],
                properties: {
                  label:       { type: 'string' },
                  color:       { type: 'string' },
                  unit:        { type: 'string' },
                  width:       { type: 'number', description: 'Line stroke width in px (default 1.5)' },
                  type:        { type: 'string', enum: ['line', 'area', 'bars', 'points'], description: 'Default line' },
                  fillOpacity: { type: 'number', description: 'Fill opacity 0–1' },
                  fillGradient:{ type: 'boolean' },
                  pointShow:   { type: 'boolean' },
                  pointSize:   { type: 'number' },
                  barWidth:    { type: 'number', description: 'Bar width fraction 0–1 (default 0.6)' },
                  dash:        { type: 'array', items: { type: 'number' } },
                  yAxis:       { type: 'string', enum: ['left', 'right'] },
                },
              },
            },
            legendPosition: { type: 'string', enum: ['top', 'bottom', 'left', 'right', 'none'] },
            legendFormat:   { type: 'string', enum: ['list', 'table'] },
            yUnit:          { type: 'string' },
            yUnit2:         { type: 'string', description: 'Unit on the secondary (right) y-axis' },
            y2Min:          { type: 'number' },
            y2Max:          { type: 'number' },
            barStack:       { type: 'boolean' },
            thresholds:     { type: 'array', items: { $ref: '#/definitions/Threshold' } },
            timeRange:      { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
            selectionMode:  { type: 'string', enum: ['x', 'y', 'xy', 'none'] },
          },
        },
      ],
    },
    HistogramSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'values'],
          properties: {
            type:        { const: 'histogram' },
            values:      { type: 'array', items: { type: 'number' }, description: 'Raw numeric values to bin and display' },
            bins:        { type: 'number', description: 'Number of bins. Default: Sturges rule' },
            color:       { type: 'string', description: 'Bar color (default #3b82f6)' },
            fillOpacity: { type: 'number', description: '0–1 (default 0.8)' },
            normalize:   { type: 'boolean', description: 'Show relative frequency % instead of count' },
            xUnit:       { type: 'string' },
            yUnit:       { type: 'string' },
          },
        },
      ],
    },
    BoxPlotSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'categories', 'series'],
          properties: {
            type:       { const: 'boxplot' },
            categories: { type: 'array', items: { type: 'string' } },
            series: {
              type: 'array',
              items: {
                type: 'object',
                required: ['label', 'color', 'data'],
                properties: {
                  label: { type: 'string' },
                  color: { type: 'string' },
                  data: {
                    type: 'array',
                    description: 'One entry per category',
                    items: {
                      type: 'object',
                      required: ['min', 'q1', 'median', 'q3', 'max'],
                      properties: {
                        min:      { type: 'number' },
                        q1:       { type: 'number' },
                        median:   { type: 'number' },
                        q3:       { type: 'number' },
                        max:      { type: 'number' },
                        outliers: { type: 'array', items: { type: 'number' } },
                      },
                    },
                  },
                },
              },
            },
            yUnit: { type: 'string' },
          },
        },
      ],
    },
    GaugeSpec: {
      type: 'object',
      required: ['type', 'value'],
      properties: {
        type:       { const: 'gauge' },
        value:      { type: 'number', description: 'Current value' },
        min:        { type: 'number', description: 'Default 0' },
        max:        { type: 'number', description: 'Default 100' },
        unit:       { type: 'string' },
        label:      { type: 'string', description: 'Label shown at the bottom' },
        thresholds: { type: 'array', items: { $ref: '#/definitions/Threshold' } },
        arcWidth:   { type: 'number', description: 'Arc thickness as fraction of radius (default 0.18)' },
        height:     { type: 'number', description: 'Component height in px (default 200)' },
      },
    },
    StatSpec: {
      type: 'object',
      required: ['type', 'value'],
      properties: {
        type:           { const: 'stat' },
        value:          { type: ['number', 'null'], description: 'Current value' },
        label:          { type: 'string', description: 'Label shown above the value' },
        unit:           { type: 'string' },
        previousValue:  { type: 'number', description: 'Used to compute trend indicator' },
        thresholds:     { type: 'array', items: { $ref: '#/definitions/Threshold' } },
        color:          { type: 'string', description: 'Override color (takes priority over thresholds)' },
        sparkline:      { type: 'array', items: { type: 'number' }, description: 'Raw values for sparkline' },
        sparklineColor: { type: 'string' },
        height:         { type: 'number', description: 'Component height in px (default 120)' },
      },
    },
    HeatmapSpec: {
      allOf: [
        { $ref: '#/definitions/BaseChartFields' },
        {
          type: 'object',
          required: ['type', 'xs', 'ys', 'xBinSize', 'yBinSize'],
          properties: {
            type:     { const: 'heatmap' },
            xs:       { type: 'array', items: { type: 'number' }, description: 'x values (Unix seconds when xTime=true)' },
            ys:       { type: 'array', items: { type: 'number' }, description: 'y values — same length as xs' },
            xBinSize: { type: 'number', description: 'Width of each x bin (seconds when xTime=true)' },
            yBinSize: { type: 'number', description: 'Height of each y bin in y-value units' },
            xTime:    { type: 'boolean', description: 'x axis is time (default true)' },
            locale:   { type: 'string' },
            yUnit:    { type: 'string' },
            palette:  { type: 'array', items: { type: 'string' }, description: 'Color array low→high density' },
          },
        },
      ],
    },
  },
}

// Compact description for system prompts
export const CHART_SPEC_DESCRIPTION = `
Use ChartSpec to render a chart. Set "type" to one of the following and provide the matching fields.

bar:        { categories: string[], series: [{label, color, values: (number|null)[]}], stacked?, orientation? }
pie:        { slices: [{label, value, color}], innerRadius?, labelType?, centerLabel?, legendPosition? }
scatter:    { series: [{label, color, xs: number[], ys: number[]}], xUnit?, yUnit? }
timeseries: { data: [[unix_timestamps], [series1_values], ...], series: [{label, color, type?}], yUnit?, thresholds? }
histogram:  { values: number[], bins?, color?, normalize? }
boxplot:    { categories: string[], series: [{label, color, data: [{min,q1,median,q3,max}]}] }
gauge:      { value: number, min?, max?, unit?, label?, thresholds? }
stat:       { value: number|null, label?, unit?, sparkline?, previousValue?, thresholds? }
heatmap:    { xs: number[], ys: number[], xBinSize: number, yBinSize: number, xTime? }

All types accept: height (px), yMin, yMax, gridStyle.
thresholds format: [{ value: number, color: string }]
`.trim()
