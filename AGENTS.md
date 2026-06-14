# ChartKit — AI Agent Instructions

## Project Overview

- **Package**: `@loykin/chartkit`
- **Description**: React chart library built on [uPlot](https://github.com/leeoniya/uPlot) — canvas-based, fast, themeable via CSS variables
- **Stack**: React 19, uPlot, TypeScript, tsup, Vitest
- **Monorepo**: root (library), `playground/` (Vite dev server)

## Commands

```bash
pnpm build          # type-check + eslint + tsup + CSS build
pnpm build:js       # tsup only
pnpm build:css      # CSS only
pnpm dev            # watch mode + playground dev server
pnpm type-check     # tsc --noEmit
pnpm lint           # eslint src
pnpm test           # vitest run
```

## Architecture

### Entry Points
- `src/index.ts` — public API exports (charts, types, spec layer)
- `src/styles/index.css` — published as `@loykin/chartkit/styles`

### Source Layout
```
src/
  bar/           — BarChart (categorical, grouped/stacked, vertical/horizontal)
  boxplot/       — BoxPlotChart (box-and-whisker, outliers)
  gauge/         — GaugeChart (270° speedometer, threshold zones)
  heatmap/       — HeatmapChart (density heatmap from flat scatter data)
  histogram/     — HistogramChart (auto-binning, normalization)
  pie/           — PieChart (pie and donut, center text, outside labels)
  scatter/       — ScatterChart (multi-series)
  stat/          — StatChart (big-number panel, sparkline, trend indicator)
  time-series/   — TimeSeriesChart (line/area/bars/points, dual y-axis, zoom/selection)
  core/          — BaseChartProps, shared types (Threshold, LineStyle, AxisConfig), plugins
  spec/          — ChartRenderer, ChartSpec, CHART_SPEC_SCHEMA, CHART_SPEC_DESCRIPTION
  styles/        — index.css (CSS custom properties)
```

### Spec Layer (`src/spec/`)

The spec layer is the AI-friendly interface on top of the React components:

- **`ChartSpec`** — discriminated union: `{ type: 'bar', ... } | { type: 'pie', ... } | ...`
- **`ChartRenderer`** — takes a `ChartSpec` and renders the matching chart component
- **`CHART_SPEC_SCHEMA`** — JSON Schema for tool definitions (MCP, function calling)
- **`CHART_SPEC_DESCRIPTION`** — compact plain-text description for system prompts

Pattern: `AI output (JSON) → ChartSpec → <ChartRenderer /> → chart`

## Key Types & Patterns

- `BaseChartProps` — shared props: `height` (`number` for fixed px, `'fill'` to expand to parent container height), `yMin`, `yMax`, `gridStyle`, `axisStyle`, `isLoading`, `error`
- `Threshold` — `{ value: number; color: string; label?; width?; dash? }`
- `LineStyle` — `{ width?: number; stroke?: string; dash?: number[] }`
- `AlignedData` — uPlot's format: `[timestamps, series1, series2, ...]` (all same length)
- `SeriesConfig` — per-series config for TimeSeriesChart: `{ label, color, type?, unit?, yAxis?, ... }`
- `ChartSpec` — discriminated union of all chart specs (omits `isLoading`, `error`, React callbacks)

## Styling

- CSS custom properties: `--background`, `--border`, `--muted-foreground`, `--destructive`
- No Tailwind in the library itself — only in the playground
- Override variables to match any design system

## Repository Boundaries

- `src/` contains the publishable library. `src/index.ts` defines the public API.
- `playground/` demonstrates and tests the library visually. Not part of the package.
- `dist/` is generated — never edit directly.

## Public API Rules

- Consumers import from `@loykin/chartkit` or `@loykin/chartkit/styles` only.
- Export every intended public component and its prop types from `src/index.ts`.
- `ChartSpec` omits `isLoading`, `error`, and React callbacks (render props, event handlers) — these are runtime state, not spec.
- Breaking changes to the spec format or chart props require a major-version bump.

## Adding a New Chart Type

1. Create `src/<name>/` with `types.ts`, `<Name>Chart.tsx`, `index.ts`
2. Extend `ChartSpec` in `src/spec/types.ts` with a new discriminated variant
3. Add a `case` in `src/spec/ChartRenderer.tsx`
4. Add the JSON Schema definition in `src/spec/schema.ts` (both `CHART_SPEC_SCHEMA` and `CHART_SPEC_DESCRIPTION`)
5. Export from `src/index.ts`
6. Add a demo in `playground/src/App.tsx` and a sidebar entry in `NAV`

## Conventions

- No unnecessary comments — only when the WHY is non-obvious
- All code, identifiers, prop names, and comments in English
- Types use `interface` for object shapes, `type` for unions and aliases
- Each chart directory is self-contained: types, component, utils, index
- `BaseChartProps` covers shared props — do not duplicate `height`, `isLoading`, etc.

## Verification

Run checks relevant to the change:

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

For visual changes, also verify in the playground.

## Documentation

Keep docs in sync whenever code changes:

| What changed | What to update |
|---|---|
| New prop on `BaseChartProps` or any chart | `AGENTS.md` Key Types section + `README.md` props table |
| New chart type | `AGENTS.md` Source Layout + `README.md` + `docs/` if design is non-trivial |
| New shared type or pattern | `AGENTS.md` Key Types section |
| Public API added or removed | `README.md` |
| `ChartSpec` / schema changed | `AGENTS.md` Spec Layer section + `src/spec/schema.ts` description strings |
| Non-trivial implementation design | `docs/<topic>.md` |
