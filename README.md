# @loykin/chartkit

A lightweight React chart library built on [uPlot](https://github.com/leeoniya/uPlot) — canvas-based, fast, and themeable via CSS variables.

[![npm](https://img.shields.io/npm/v/@loykin/chartkit)](https://www.npmjs.com/package/@loykin/chartkit)
[![license](https://img.shields.io/npm/l/@loykin/chartkit)](./LICENSE)

**[Live Playground](https://loykin.github.io/chartkit)** · **[GitHub](https://github.com/loykin/chartkit)**

---

## Features

- **TimeSeriesChart** — line, area, bars, and points; dual y-axis; stacking; threshold lines; zoom/selection; custom tooltip & legend
- **HistogramChart** — auto-binning (Sturges rule), normalization to relative frequency
- **HeatmapChart** — density heatmap from flat (x, y) scatter data; customizable color palette
- **ScatterChart** — multi-series scatter plot; configurable point sizes
- **BoxPlotChart** — box-and-whisker with outlier dots; multi-series per category
- **PieChart** — pie and donut; inside/outside labels with leader lines; center text
- **StatChart** — single big-number panel; trend indicator; sparkline; threshold coloring
- **GaugeChart** — 270° speedometer gauge; threshold color zones; min/max labels
- **BarChart** — categorical bar chart; grouped or stacked; vertical and horizontal orientation
- CSS variable theming — drop in any design system
- Loading and error states built-in

---

## Installation

```bash
npm install @loykin/chartkit uplot react react-dom
```

Peer dependencies: `react ^19`, `react-dom ^19`, `uplot ^1.6`

---

## CSS Setup

Import the stylesheet once in your app entry point:

```ts
import '@loykin/chartkit/styles'
```

### Theming

The library uses CSS variables. Override them to match your design system:

```css
:root {
  --background:        #ffffff;
  --border:            #e2e8f0;
  --muted-foreground:  #94a3b8;
  --destructive:       #ef4444;
}
```

---

## Usage

### TimeSeriesChart

```tsx
import { TimeSeriesChart } from '@loykin/chartkit'

<TimeSeriesChart
  data={[timestamps, cpuValues, memValues]}
  series={[
    { label: 'CPU',    color: '#3b82f6', type: 'area', unit: '%' },
    { label: 'Memory', color: '#10b981', type: 'line', unit: 'MB', yAxis: 'right' },
  ]}
  yUnit="%" yUnit2="MB"
  height={300}
/>
```

#### Threshold lines

```tsx
<TimeSeriesChart
  data={data} series={series}
  thresholds={[
    { value: 80, color: '#f59e0b', label: 'Warning',  dash: [4, 2] },
    { value: 90, color: '#ef4444', label: 'Critical', width: 1.5  },
  ]}
/>
```

### HistogramChart

```tsx
import { HistogramChart } from '@loykin/chartkit'

<HistogramChart
  values={latencySamples}
  bins={30}
  color="#6366f1"
  xUnit="ms"
  height={260}
/>
```

### HeatmapChart

```tsx
import { HeatmapChart } from '@loykin/chartkit'

<HeatmapChart
  xs={timestampsFlat}   // Unix seconds
  ys={latencyFlat}
  xBinSize={60}         // 1-minute x buckets
  yBinSize={5}          // 5 ms y buckets
  yUnit="ms"
  height={300}
/>
```

Custom palette:

```tsx
import { HeatmapChart, GRAD_METAL } from '@loykin/chartkit'

<HeatmapChart palette={GRAD_METAL} ... />
```

### ScatterChart

```tsx
import { ScatterChart } from '@loykin/chartkit'

<ScatterChart
  series={[
    { label: 'Group A', color: '#3b82f6', xs: xsA, ys: ysA },
    { label: 'Group B', color: '#f59e0b', xs: xsB, ys: ysB, pointSize: 6 },
  ]}
  xUnit="ms" yUnit="req/s"
  height={300}
/>
```

### BoxPlotChart

```tsx
import { BoxPlotChart } from '@loykin/chartkit'

<BoxPlotChart
  categories={['Jan', 'Feb', 'Mar']}
  series={[
    {
      label: 'p99',
      color: '#3b82f6',
      data: [
        { min: 10, q1: 20, median: 30, q3: 45, max: 60, outliers: [70, 80] },
        { min: 12, q1: 22, median: 35, q3: 50, max: 65 },
        { min: 8,  q1: 18, median: 28, q3: 40, max: 55 },
      ],
    },
  ]}
  yUnit="ms"
  height={300}
/>
```

### PieChart

```tsx
import { PieChart } from '@loykin/chartkit'

// Pie
<PieChart
  slices={[
    { label: 'Nginx',      value: 42, color: '#3b82f6' },
    { label: 'PostgreSQL', value: 27, color: '#10b981' },
    { label: 'Redis',      value: 13, color: '#f59e0b' },
  ]}
  labelType="percent"
  height={300}
/>

// Donut with center label and outside labels
<PieChart
  slices={slices}
  innerRadius={0.6}
  labelType="name+percent"
  labelPosition="outside"
  centerLabel={"99\nTotal"}
  legendPosition="right"
  height={300}
/>
```

### StatChart

```tsx
import { StatChart } from '@loykin/chartkit'

<StatChart
  value={94.2}
  unit="%"
  label="CPU Usage"
  previousValue={78.5}
  thresholds={[
    { value: 0,  color: '#10b981' },
    { value: 80, color: '#f59e0b' },
    { value: 90, color: '#ef4444' },
  ]}
  sparkline={recentValues}
  height={130}
/>
```

### GaugeChart

```tsx
import { GaugeChart } from '@loykin/chartkit'

<GaugeChart
  value={67}
  min={0}
  max={100}
  unit="%"
  label="CPU Usage"
  thresholds={[
    { value: 0,  color: '#10b981' },
    { value: 60, color: '#f59e0b' },
    { value: 80, color: '#ef4444' },
  ]}
  height={200}
/>
```

### BarChart

```tsx
import { BarChart } from '@loykin/chartkit'

// Grouped vertical (default)
<BarChart
  categories={['Jan', 'Feb', 'Mar', 'Apr']}
  series={[
    { label: 'Service A', color: '#3b82f6', values: [42, 55, 38, 61] },
    { label: 'Service B', color: '#10b981', values: [28, 34, 45, 32] },
  ]}
  yUnit="ms"
  height={300}
/>

// Stacked horizontal
<BarChart
  categories={categories}
  series={series}
  orientation="horizontal"
  stacked
  height={300}
/>
```

> **TimeSeriesChart vs BarChart** — `TimeSeriesChart` bars use a time-based x-axis (Unix timestamps, zoom/pan supported). `BarChart` uses string categories with no time concept, supporting grouped/stacked layout and horizontal orientation.

---

## ChartRenderer — AI & Agent API

AI agents reliably produce **JSON** but struggle with React component syntax — import paths break, prop names drift, and there's no runtime validation. `ChartRenderer` solves this by introducing a declarative `ChartSpec` format that any JSON-producing system can target.

```
AI / agent / backend  →  ChartSpec (JSON)  →  <ChartRenderer />  →  chart
```

### React usage

```tsx
import { ChartRenderer } from '@loykin/chartkit'
import type { ChartSpec } from '@loykin/chartkit'

const spec: ChartSpec = {
  type: 'bar',
  categories: ['Jan', 'Feb', 'Mar'],
  series: [
    { label: 'Revenue', color: '#3b82f6', values: [42, 55, 38] },
  ],
  yUnit: 'k$',
  height: 300,
}

<ChartRenderer spec={spec} />
```

`isLoading` and `error` are passed separately (runtime state, not part of the spec):

```tsx
<ChartRenderer spec={spec} isLoading={loading} error={err} />
```

### MCP tool definition

Expose `CHART_SPEC_SCHEMA` as the input schema for an MCP tool — the model then calls the tool with a valid spec directly:

```ts
import { CHART_SPEC_SCHEMA } from '@loykin/chartkit'

const tools = [{
  name: 'render_chart',
  description: 'Render a chart from a declarative spec',
  inputSchema: CHART_SPEC_SCHEMA,
}]
```

### System prompt / function calling

`CHART_SPEC_DESCRIPTION` is a compact plain-text summary of all chart types and their fields — paste it into a system prompt so the model knows what to generate:

```ts
import { CHART_SPEC_DESCRIPTION } from '@loykin/chartkit'

const systemPrompt = `
You are a data assistant. When the user asks for a chart, output a ChartSpec JSON object.

${CHART_SPEC_DESCRIPTION}
`
```

### Supported `type` values

| `type`       | Required fields                                        |
|--------------|--------------------------------------------------------|
| `bar`        | `categories`, `series[].{label, color, values}`        |
| `pie`        | `slices[].{label, value, color}`                       |
| `scatter`    | `series[].{label, color, xs, ys}`                      |
| `timeseries` | `data` (AlignedData), `series[].{label, color}`        |
| `histogram`  | `values`                                               |
| `boxplot`    | `categories`, `series[].{label, color, data[].{min,q1,median,q3,max}}` |
| `gauge`      | `value`                                                |
| `stat`       | `value`                                                |
| `heatmap`    | `xs`, `ys`, `xBinSize`, `yBinSize`                     |

All types accept the same optional base fields as the individual components (`height`, `yMin`, `yMax`, `gridStyle`, `axisStyle`).

---

## Props

### Shared — `BaseChartProps`

| Prop        | Type                    | Default | Description                          |
|-------------|-------------------------|---------|--------------------------------------|
| `height`    | `number`                | `300`   | Canvas height in px                  |
| `yMin`      | `number`                | auto    | Primary y-axis minimum               |
| `yMax`      | `number`                | auto    | Primary y-axis maximum               |
| `gridStyle` | `LineStyle \| false`    | —       | Grid line style; `false` = hide      |
| `axisStyle` | `AxisConfig \| false`   | —       | Axis border + ticks; `false` = hide  |
| `isLoading` | `boolean`               | —       | Show loading spinner overlay         |
| `error`     | `Error \| null`         | —       | Show error message instead of chart  |

### `LineStyle`

| Prop     | Type       | Description                              |
|----------|------------|------------------------------------------|
| `width`  | `number`   | Line width in px (default `0.5`)         |
| `stroke` | `string`   | CSS color (default: `--border`)          |
| `dash`   | `number[]` | Dash pattern e.g. `[4, 2]`; solid if omitted |

### `Threshold`

| Prop    | Type       | Description                                    |
|---------|------------|------------------------------------------------|
| `value` | `number`   | Boundary value at which this color activates   |
| `color` | `string`   | CSS color string                               |
| `label` | `string`   | Label drawn near the line (TimeSeries only)    |
| `width` | `number`   | Line width in px (TimeSeries only)             |
| `dash`  | `number[]` | Dash pattern (TimeSeries only)                 |

### `TimeSeriesChart`

| Prop               | Type                      | Default     | Description                                        |
|--------------------|---------------------------|-------------|----------------------------------------------------|
| `data`             | `AlignedData`             | **required**| `[timestamps, ...seriesValues]`                    |
| `series`           | `SeriesConfig[]`          | **required**| One entry per data series                          |
| `thresholds`       | `Threshold[]`             | —           | Horizontal reference lines on the primary y-axis   |
| `legendPosition`   | `'top'\|'bottom'\|'left'\|'right'\|'none'` | `'bottom'` | Legend placement      |
| `legendFormat`     | `'list'\|'table'`         | `'list'`    | Legend display mode                                |
| `yUnit`            | `string`                  | —           | Primary y-axis unit                                |
| `yUnitDisplay`     | `'label'\|'tick'`         | `'label'`   | How to show `yUnit`                                |
| `yUnit2`           | `string`                  | —           | Secondary y-axis unit                              |
| `xShowDate`        | `boolean`                 | `true`      | Show date on second line when it changes           |
| `locale`           | `string`                  | browser     | Date formatting locale                             |
| `barStack`         | `boolean`                 | —           | Stack bar series                                   |
| `selectionMode`    | `'x'\|'y'\|'xy'\|'none'`  | —           | Drag selection mode                                |
| `onSelect`         | `(s) => void`             | —           | Fired on drag-select with time/y range             |
| `timeRange`        | `[number, number]`        | —           | Controlled x-axis range (Unix seconds)             |
| `onTimeRangeChange`| `(r) => void`             | —           | Fired when x range changes                         |
| `renderLegend`     | `(items) => ReactNode`    | —           | Custom legend renderer                             |
| `renderTooltip`    | `(payload) => ReactNode`  | —           | Custom tooltip renderer                            |

### `SeriesConfig`

| Prop          | Type                             | Default  | Description                         |
|---------------|----------------------------------|----------|-------------------------------------|
| `label`       | `string`                         | required | Display name                        |
| `color`       | `string`                         | required | Line/fill color                     |
| `unit`        | `string`                         | —        | Value unit in legend                |
| `type`        | `'line'\|'area'\|'bars'\|'points'` | `'line'` | Series render type                 |
| `width`       | `number`                         | `1.5`    | Stroke width in px                  |
| `fillOpacity` | `number`                         | —        | Fill opacity 0–1                    |
| `fillGradient`| `boolean`                        | —        | Vertical gradient fill (area only)  |
| `pointShow`   | `boolean`                        | `false`  | Show dots on line/area              |
| `pointSize`   | `number`                         | `4`      | Dot radius in px                    |
| `barWidth`    | `number`                         | `0.6`    | Bar width as fraction of x-spacing  |
| `dash`        | `number[]`                       | —        | Dash pattern e.g. `[4, 2]`          |
| `yAxis`       | `'left'\|'right'`                | `'left'` | Which y-axis to bind                |

### `HistogramChart`

| Prop          | Type      | Default    | Description                              |
|---------------|-----------|------------|------------------------------------------|
| `values`      | `number[]`| **required**| Raw values to bin                       |
| `bins`        | `number`  | Sturges    | Number of bins                           |
| `color`       | `string`  | `#3b82f6`  | Bar fill color                           |
| `fillOpacity` | `number`  | `0.8`      | Bar fill opacity 0–1                     |
| `normalize`   | `boolean` | `false`    | Normalize y-axis to relative frequency % |
| `xUnit`       | `string`  | —          | X-axis unit suffix                       |
| `yUnit`       | `string`  | —          | Y-axis unit suffix (ignored when `normalize=true`) |

### `HeatmapChart`

| Prop        | Type       | Default       | Description                                      |
|-------------|------------|---------------|--------------------------------------------------|
| `xs`        | `number[]` | **required**  | Flat x values (Unix seconds when `xTime=true`)   |
| `ys`        | `number[]` | **required**  | Flat y values (same length as `xs`)              |
| `xBinSize`  | `number`   | **required**  | Width of each x bin (seconds when `xTime=true`)  |
| `yBinSize`  | `number`   | **required**  | Height of each y bin (in y-value units)          |
| `xTime`     | `boolean`  | `true`        | Treat x as Unix timestamps                       |
| `locale`    | `string`   | browser       | Locale for x-axis time formatting                |
| `yUnit`     | `string`   | —             | Y-axis unit label                                |
| `palette`   | `string[]` | `GRAD_METAL`  | Color palette array (low → high density)         |

### `ScatterChart`

| Prop     | Type                    | Default      | Description              |
|----------|-------------------------|--------------|--------------------------|
| `series` | `ScatterSeriesConfig[]` | **required** | One entry per data group |
| `xUnit`  | `string`                | —            | X-axis unit label        |
| `yUnit`  | `string`                | —            | Y-axis unit label        |

**`ScatterSeriesConfig`**

| Prop        | Type       | Default | Description              |
|-------------|------------|---------|--------------------------|
| `label`     | `string`   | required| Display name             |
| `color`     | `string`   | required| Point color              |
| `xs`        | `number[]` | required| X values                 |
| `ys`        | `number[]` | required| Y values                 |
| `pointSize` | `number`   | `4`     | Point radius in CSS px   |

### `BoxPlotChart`

| Prop         | Type                 | Default      | Description                       |
|--------------|----------------------|--------------|-----------------------------------|
| `categories` | `string[]`           | **required** | Category labels on the x-axis     |
| `series`     | `BoxSeriesConfig[]`  | **required** | One entry per data series         |
| `yUnit`      | `string`             | —            | Y-axis unit label                 |

**`BoxSeriesConfig`** / **`BoxStats`**

| Prop       | Type       | Description                                    |
|------------|------------|------------------------------------------------|
| `label`    | `string`   | Display name                                   |
| `color`    | `string`   | Box/whisker color                              |
| `data`     | `BoxStats[]`| One entry per category                        |
| `min`      | `number`   | Whisker bottom                                 |
| `q1`       | `number`   | Box bottom (25th percentile)                   |
| `median`   | `number`   | Median line                                    |
| `q3`       | `number`   | Box top (75th percentile)                      |
| `max`      | `number`   | Whisker top                                    |
| `outliers` | `number[]` | Values outside whiskers — rendered as dots     |

### `PieChart`

| Prop             | Type                              | Default    | Description                                  |
|------------------|-----------------------------------|------------|----------------------------------------------|
| `slices`         | `PieSliceConfig[]`                | **required**| One entry per slice                         |
| `innerRadius`    | `number`                          | `0`        | Inner radius fraction 0–1 (0=pie, 0.6=donut) |
| `labelType`      | `PieLabelType`                    | `'percent'`| What to print on each slice                  |
| `labelPosition`  | `'inside'\|'outside'`             | `'inside'` | Where to place slice labels                  |
| `centerLabel`    | `string`                          | —          | Text in the center hole (donut only). `\n` for line break |
| `legendPosition` | `'right'\|'bottom'\|'none'`       | `'right'`  | Legend placement                             |
| `unit`           | `string`                          | —          | Unit shown in tooltip and legend             |

**`PieLabelType`**: `'name'` · `'value'` · `'percent'` · `'name+percent'` · `'none'`

### `StatChart`

| Prop            | Type         | Default    | Description                                      |
|-----------------|--------------|------------|--------------------------------------------------|
| `value`         | `number\|null`| **required**| Current value                                  |
| `label`         | `string`     | —          | Label shown above the value                      |
| `unit`          | `string`     | —          | Unit suffix                                      |
| `previousValue` | `number`     | —          | Previous value for trend indicator               |
| `thresholds`    | `Threshold[]`| —          | Color zones (highest threshold ≤ value wins)     |
| `color`         | `string`     | —          | Override color (takes priority over thresholds)  |
| `sparkline`     | `number[]`   | —          | Raw values for the sparkline                     |
| `sparklineColor`| `string`     | —          | Sparkline color (defaults to value color)        |
| `height`        | `number`     | `120`      | Component height in px                           |

### `GaugeChart`

| Prop         | Type         | Default  | Description                                        |
|--------------|--------------|----------|----------------------------------------------------|
| `value`      | `number`     | **required**| Current value                                   |
| `min`        | `number`     | `0`      | Gauge range minimum                                |
| `max`        | `number`     | `100`    | Gauge range maximum                                |
| `unit`       | `string`     | —        | Unit suffix shown inside the gauge                 |
| `label`      | `string`     | —        | Label shown below the value                        |
| `thresholds` | `Threshold[]`| —        | Color zones painted as arc segments                |
| `arcWidth`   | `number`     | `0.18`   | Arc thickness as a fraction of the radius (0–1)    |
| `height`     | `number`     | `200`    | Component height in px                             |

### `BarChart`

| Prop          | Type                | Default      | Description                              |
|---------------|---------------------|--------------|------------------------------------------|
| `categories`  | `string[]`          | **required** | Category labels                          |
| `series`      | `BarSeriesConfig[]` | **required** | One entry per data series                |
| `stacked`     | `boolean`           | `false`      | Stack bars instead of grouping           |
| `orientation` | `'vertical'\|'horizontal'` | `'vertical'` | Bar orientation              |
| `xUnit`       | `string`            | —            | Unit on the category axis                |
| `yUnit`       | `string`            | —            | Unit on the value axis                   |

**`BarSeriesConfig`**

| Prop     | Type               | Description                          |
|----------|--------------------|--------------------------------------|
| `label`  | `string`           | Display name                         |
| `color`  | `string`           | Bar fill color                       |
| `values` | `(number\|null)[]` | One value per category; null = skip  |

---

## License

[MIT](./LICENSE) © 2026 LeeSuk
