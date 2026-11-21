# @loykin/chartkit

A lightweight React chart library built on [uPlot](https://github.com/leeoniya/uPlot) — canvas-based, fast, and themeable via CSS variables.

---

## Features

- **TimeSeriesChart** — line, area, bars, and points; dual y-axis; stacking; threshold lines; zoom/selection; custom tooltip & legend
- **CandlestickChart** — OHLC candles; volume overlay; hover values; controlled range and drag selection
- **HistogramChart** — auto-binning (Sturges rule), normalization to relative frequency
- **HeatmapChart** — density heatmap from flat (x, y) scatter data; customizable color palette
- **ScatterChart** — multi-series scatter plot; configurable point sizes
- **BoxPlotChart** — box-and-whisker with outlier dots; multi-series per category
- **PieChart** — pie and donut; inside/outside labels with leader lines; center text
- **StatChart** — single big-number panel; trend indicator; sparkline; threshold coloring
- **GaugeChart** — 270° speedometer gauge; threshold color zones; min/max labels
- **BarGaugeChart** — horizontal/vertical value gauges; mixed-sign ranges and zero baselines
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

### Runtime formatter and tooltip defaults

ChartKit keeps default number, time, label, percentage, and tooltip rendering. Applications can
provide defaults above a chart tree:

```tsx
import { ChartKitProvider } from '@loykin/chartkit'

<ChartKitProvider
  formatters={{
    value: (value, context) =>
      context.unit === 'bytes' ? formatBytes(value) : value.toLocaleString(),
    time: (unixSeconds) => new Date(unixSeconds * 1000).toLocaleString(),
    percentage: (percentage) => `${percentage.toFixed(2)}%`,
  }}
  renderTooltip={(payload) => <ApplicationTooltip payload={payload} />}
>
  <DashboardCharts />
</ChartKitProvider>
```

Every chart accepts a `formatters` prop for a local override. `TimeSeriesChart`, `PieChart`, and
`CandlestickChart` also accept `renderTooltip` for chart-specific rendering. Resolution order is
chart override, then the nearest provider value, then ChartKit's built-in behavior.

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

### CandlestickChart

```tsx
import { CandlestickChart } from '@loykin/chartkit'

<CandlestickChart
  data={[
    { time: 1724889600, open: 188.4, high: 191.2, low: 187.8, close: 190.6, volume: 24_800_000 },
    { time: 1724976000, open: 190.6, high: 192.1, low: 189.2, close: 189.8, volume: 21_300_000 },
  ]}
  yUnit="USD"
  height={360}
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

## Props

### Shared — `BaseChartProps`

| Prop        | Type                    | Default | Description                          |
|-------------|-------------------------|---------|--------------------------------------|
| `height`    | `number \| 'fill'`     | `300`   | Canvas height in px, or `'fill'` to expand to the parent container's height (parent must have explicit height) |
| `yMin`      | `number`                | auto    | Primary y-axis minimum               |
| `yMax`      | `number`                | auto    | Primary y-axis maximum               |
| `gridStyle` | `LineStyle \| false`    | —       | Grid line style; `false` = hide      |
| `axisStyle` | `AxisConfig \| false`   | —       | Axis border + ticks; `false` = hide  |
| `isLoading` | `boolean`               | —       | Show loading spinner overlay         |
| `error`     | `Error \| null`         | —       | Show error message instead of chart  |
| `formatters`| `ChartFormatters`         | provider/default | Runtime-only number, time, label, and percentage overrides |
| `renderEmpty` | `() => ReactNode`       | —       | Runtime-only replacement for the empty-data state |
| `renderLoading` | `() => ReactNode`     | —       | Runtime-only replacement inside the loading overlay |
| `renderError` | `(error) => ReactNode`  | —       | Runtime-only replacement for the error state |

`GaugeChart` and `StatChart` have no empty-data state, so they expose only `renderLoading` and
`renderError`.

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
| `markers`          | `readonly TimeSeriesMarker[]` | —        | Stateless vertical event overlays                  |
| `regions`          | `readonly TimeSeriesRegion[]` | —        | Stateless Unix-second range overlays               |
| `onMarkerClick`    | `(marker) => void`         | —           | Runtime-only marker activation                     |
| `onRegionClick`    | `(region) => void`         | —           | Runtime-only region activation                     |
| `legendPosition`   | `'top'\|'bottom'\|'left'\|'right'\|'none'` | `'bottom'` | Legend placement      |
| `legendFormat`     | `'list'\|'table'`         | `'list'`    | Legend display mode                                |
| `yUnit`            | `string`                  | —           | Primary y-axis unit                                |
| `yUnitDisplay`     | `'label'\|'tick'`         | `'label'`   | How to show `yUnit`                                |
| `yUnit2`           | `string`                  | —           | Secondary y-axis unit                              |
| `xShowDate`        | `boolean`                 | `true`      | Show date on second line when it changes           |
| `locale`           | `string`                  | browser     | Date formatting locale                             |
| `sync`             | `false \| TimeSeriesSyncConfig` | `false` | Explicit cursor synchronization group              |
| `hiddenSeriesIds`  | `readonly string[]`       | uncontrolled | Controlled hidden series IDs; requires stable `SeriesConfig.id` values |
| `onHiddenSeriesIdsChange` | `(ids: string[]) => void` | — | Emits legend and synchronized visibility changes |
| `onDatumClick`     | `(event: ChartDatumEvent) => void` | — | Nearest visible series datum on pointer click |
| `onDatumHover`     | `(event: ChartDatumEvent \| null) => void` | — | Nearest visible series datum while hovering |
| `formatters`       | `ChartFormatters`         | provider/default | Runtime-only number, time, label, and percentage overrides |
| `tooltip`          | `boolean \| TooltipPolicy` | `true`     | Show tooltip; select `all`, `nearest`, and `maxItems` |
| `selectTooltipItems` | `(items, cursor) => items` | —         | Runtime-only custom item selection before rendering |
| `barStack`         | `boolean`                 | —           | Stack bar series                                   |
| `selectionMode`    | `'x'\|'y'\|'xy'\|'none'`  | —           | Drag selection mode                                |
| `onSelect`         | `(s) => void`             | —           | Fired on drag-select with time/y range             |
| `timeRange`        | `[number, number]`        | —           | Controlled x-axis range (Unix seconds)             |
| `onTimeRangeChange`| `(r) => void`             | —           | Fired when x range changes                         |
| `renderLegend`     | `(items) => ReactNode`    | —           | Custom legend renderer                             |
| `renderTooltip`    | `(payload) => ReactNode`  | —           | Custom tooltip renderer; payload includes the original `datumIndex` |

Related time-series charts can opt into uPlot cursor synchronization. Unrelated charts remain
independent by default:

```tsx
const sync = { id: 'detail-charts', series: false } as const

<TimeSeriesChart data={cpuData} series={cpuSeries} sync={sync} />
<TimeSeriesChart data={memoryData} series={memorySeries} sync={sync} />
```

`series: false` synchronizes only the cursor. Synchronization remains an explicit TimeSeries prop.

Tooltip item selection is applied before both custom and built-in renderers:

```tsx
<TimeSeriesChart tooltip={{ mode: 'nearest', maxItems: 1 }} />
```

`selectTooltipItems` overrides the built-in mode when application-specific filtering is needed;
`maxItems` still applies to its result.

Visibility may also be controlled by stable series identity:

```tsx
const [hiddenSeriesIds, setHiddenSeriesIds] = useState<string[]>([])

<TimeSeriesChart
  data={data}
  series={series}
  hiddenSeriesIds={hiddenSeriesIds}
  onHiddenSeriesIdsChange={setHiddenSeriesIds}
/>
```

Series without an `id` retain backward-compatible uncontrolled legend behavior. Controlled
Visibility and callbacks remain local to the chart component.

Datum events contain the original `datumIndex`, x/y values, and viewport `clientX/clientY`.
Provide `SeriesConfig.id` for stable `seriesId`; series without one fall back to their input index.
The same runtime-only contract is available on `BarChart`, `ScatterChart`, and `HistogramChart`.

### `SeriesConfig`

| Prop          | Type                             | Default  | Description                         |
|---------------|----------------------------------|----------|-------------------------------------|
| `id`          | `string`                         | —        | Stable series identity for runtime payloads |
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

### `CandlestickChart`

| Prop             | Type                       | Default     | Description                                  |
|------------------|----------------------------|-------------|----------------------------------------------|
| `data`           | `CandlestickDataPoint[]`   | **required**| Chronological Unix-second OHLCV candles      |
| `upColor`        | `string`                   | `#22c55e`   | Rising candle color                          |
| `downColor`      | `string`                   | `#ef4444`   | Falling candle color                         |
| `candleWidth`    | `number`                   | `0.65`      | Body width as a fraction of time spacing     |
| `showVolume`     | `boolean`                  | `true`      | Draw the volume overlay                      |
| `volumeHeight`   | `number`                   | `0.2`       | Plot-height fraction used by volume (0–0.5)  |
| `yUnit`          | `string`                   | —           | Price unit                                   |
| `locale`         | `string`                   | browser     | Date and number locale                       |
| `showXAxis`      | `boolean`                  | `true`      | Show the time axis below the plot            |
| `showLegend`     | `boolean`                  | `true`      | Show current OHLCV values                    |
| `selectionMode`  | `'x'\|'y'\|'xy'\|'none'` | `'x'`       | Drag selection mode                          |
| `timeRange`      | `[number, number]`         | —           | Controlled Unix-second x-axis range          |
| `onTimeRangeChange` | `(range) => void`       | —           | Fired after x-range selection                |
| `renderTooltip`  | `(payload) => ReactNode`   | —           | Custom candle tooltip renderer               |
| `tooltip`        | `boolean`                  | `true`      | Show the built-in, provider, or chart tooltip |

### `HistogramChart`

| Prop          | Type      | Default    | Description                              |
|---------------|-----------|------------|------------------------------------------|
| `values`      | `number[]`| **required**| Raw values to bin                       |
| `id`          | `string`  | `'histogram'` | Stable series identity for runtime events |
| `bins`        | `number`  | Sturges    | Number of bins                           |
| `color`       | `string`  | `#3b82f6`  | Bar fill color                           |
| `fillOpacity` | `number`  | `0.8`      | Bar fill opacity 0–1                     |
| `normalize`   | `boolean` | `false`    | Normalize y-axis to relative frequency % |
| `xUnit`       | `string`  | —          | X-axis unit suffix                       |
| `yUnit`       | `string`  | —          | Y-axis unit suffix (ignored when `normalize=true`) |
| `onDatumClick` / `onDatumHover` | `ChartDatumEvent` callbacks | — | Runtime-only bin interaction |

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
| `onDatumClick` / `onDatumHover` | `ChartDatumEvent` callbacks | — | Runtime-only point interaction |

**`ScatterSeriesConfig`**

| Prop        | Type       | Default | Description              |
|-------------|------------|---------|--------------------------|
| `id`        | `string`   | —       | Stable event identity    |
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
| `formatters`     | `ChartFormatters`                 | provider/default | Runtime-only value, label, and percentage overrides |
| `tooltip`        | `boolean`                         | `true`     | Show the built-in, provider, or chart tooltip |
| `renderTooltip`  | `(payload) => ReactNode`          | —          | Per-chart tooltip renderer                   |
| `hiddenSliceIds` | `readonly string[]`                | uncontrolled | Controlled hidden slice IDs; requires stable IDs |
| `onHiddenSliceIdsChange` | `(ids: string[]) => void` | —          | Emits the next hidden slice IDs              |
| `onSliceClick`   | `(event: PieSliceEvent) => void`   | —          | Slice pointer activation                     |
| `onSliceHover`   | `(event: PieSliceEvent \| null) => void` | —    | Slice enter/change and leave                 |
| `onLegendItemClick` | `(event: PieLegendItemEvent) => void` | —   | Keyboard or pointer legend activation        |
| `renderLegend`   | `(items, toggleSlice) => ReactNode`| —          | Runtime-only custom legend slot              |

**`PieLabelType`**: `'name'` · `'value'` · `'percent'` · `'name+percent'` · `'none'`

`PieSliceConfig.id` is optional and supplies stable slice identity to runtime payloads and
controlled visibility. Hidden slices are removed from geometry and the visible total; percentages
are recalculated from the remaining positive finite values. Zero, negative, `NaN`, and infinite
values contribute zero geometry while their raw value remains available to formatters and events.
ID-less slices retain backward-compatible uncontrolled, index-based legend behavior. Runtime state,
Events and render slots remain local to the chart component.

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
| `height`        | `number \| 'fill'` | `120` | Component height in px, or `'fill'` to expand to parent |

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
| `height`     | `number \| 'fill'` | `200` | Component height in px, or `'fill'` to expand to parent |

### `BarGaugeChart`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `readonly BarGaugeItem[]` | **required** | Final pre-aggregated values with stable IDs |
| `orientation` | `'horizontal'\|'vertical'` | `'horizontal'` | Gauge direction |
| `valueDisplay` | `'value'\|'percent'\|'both'\|'none'` | `'value'` | Text shown per item |
| `min` / `max` | `number` | `0` / `100` | Shared fallback range; item ranges override it |
| `unit` | `string` | — | Display unit |
| `onItemClick` | `(item) => void` | — | Runtime-only keyboard/pointer activation |
| `renderValue` | `(item, value, percent) => ReactNode` | — | Runtime-only value slot |

Values are clamped only for geometry; formatted text keeps the original value. Mixed-sign ranges
draw from a zero baseline. `0` is valid, while null and non-finite values render as missing. Large
item collections scroll inside the configured chart height; vertical bars keep a 96 px minimum width.

### `BarChart`

| Prop          | Type                | Default      | Description                              |
|---------------|---------------------|--------------|------------------------------------------|
| `categories`  | `string[]`          | **required** | Category labels                          |
| `series`      | `BarSeriesConfig[]` | **required** | One entry per data series                |
| `stacked`     | `boolean`           | `false`      | Stack bars instead of grouping           |
| `orientation` | `'vertical'\|'horizontal'` | `'vertical'` | Bar orientation              |
| `xUnit`       | `string`            | —            | Unit on the category axis                |
| `yUnit`       | `string`            | —            | Unit on the value axis                   |
| `onDatumClick` / `onDatumHover` | `ChartDatumEvent<string>` callbacks | — | Runtime-only bar interaction; `x` is the category label |

**`BarSeriesConfig`**

| Prop     | Type               | Description                          |
|----------|--------------------|--------------------------------------|
| `id`     | `string`           | Stable event identity                |
| `label`  | `string`           | Display name                         |
| `color`  | `string`           | Bar fill color                       |
| `values` | `(number\|null)[]` | One value per category; null = skip  |

---

## License

[MIT](./LICENSE) © 2026 LeeSuk
