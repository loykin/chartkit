import { useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json as jsonLang } from '@codemirror/lang-json'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  TimeSeriesChart, HistogramChart, HeatmapChart, ScatterChart,
  BoxPlotChart, PieChart, StatChart, GaugeChart, BarChart, GRAD_METAL,
  ChartRenderer,
} from '@loykin/chartkit'
import type {
  AlignedData, SeriesConfig, AxisConfig, LineStyle,
  LegendPosition, LegendFormat, LegendItem, SelectionMode, TooltipPayload,
  ScatterSeriesConfig, BoxSeriesConfig, BoxStats,
  PieSliceConfig, PieLabelType,
  BarSeriesConfig, Threshold,
  ChartSpec,
} from '@loykin/chartkit'

// ── Demo data ─────────────────────────────────────────────────────────────────

const STEP = 60
const N    = 120

const midnight = new Date()
midnight.setHours(0, 0, 0, 0)
const DEMO_START = Math.floor(midnight.getTime() / 1000) - 60 * 60

function generateData(): AlignedData {
  const ts: number[] = [], cpu: number[] = [], mem: number[] = [], rps: number[] = []
  for (let i = 0; i < N; i++) {
    ts.push(DEMO_START + i * STEP)
    cpu.push(30 + Math.sin(i / 10) * 20 + Math.random() * 5)
    mem.push(60 + Math.cos(i / 15) * 10 + Math.random() * 3)
    rps.push(200 + Math.sin(i / 8) * 80 + Math.random() * 20)
  }
  return [ts, cpu, mem, rps]
}

function generateDualData(): AlignedData {
  const ts: number[] = [], temp: number[] = [], hum: number[] = []
  for (let i = 0; i < N; i++) {
    ts.push(DEMO_START + i * STEP)
    temp.push(20 + Math.sin(i / 20) * 8 + Math.random() * 1.5)
    hum.push(55 + Math.cos(i / 12) * 20 + Math.random() * 3)
  }
  return [ts, temp, hum]
}

const DEMO_DATA = generateData()
const DUAL_DATA = generateDualData()

const DUAL_SERIES: SeriesConfig[] = [
  { label: 'Temperature', color: '#ef4444', unit: '°C', type: 'area', fillOpacity: 0.1, yAxis: 'left'  },
  { label: 'Humidity',    color: '#3b82f6', unit: '%',  type: 'line',                   yAxis: 'right' },
]

const BASE_SERIES = [
  { label: 'CPU',    color: '#3b82f6', unit: '%'     },
  { label: 'Memory', color: '#10b981', unit: '%'     },
  { label: 'RPS',    color: '#f59e0b', unit: 'req/s' },
]

type ChartType    = NonNullable<SeriesConfig['type']>
type DashPreset   = 'solid' | 'dashed' | 'dotted'

const DASH_PRESETS: Record<DashPreset, number[] | undefined> = {
  solid:  undefined,
  dashed: [4, 4],
  dotted: [1, 3],
}

const CHART_TYPES:      ChartType[]      = ['line', 'area', 'bars', 'points']
const LINE_WIDTHS                        = [0.5, 1, 2] as const
const DASH_KEYS:        DashPreset[]     = ['solid', 'dashed', 'dotted']
const FILL_OPACITIES                     = [0.1, 0.15, 0.3, 0.5, 1] as const
const BAR_WIDTHS                         = [0.4, 0.6, 0.8, 1.0] as const
const LEGEND_POSITIONS: LegendPosition[] = ['bottom', 'top', 'left', 'right', 'none']
const LEGEND_FORMATS:   LegendFormat[]   = ['list', 'table']
const SELECTION_MODES:  SelectionMode[]  = ['x', 'y', 'xy', 'none']

const COUNT      = 360
const NOW        = Math.floor(Date.now() / 1000)
const overviewTs = Array.from({ length: COUNT }, (_, i) => NOW - (COUNT - i) * 60)

function sine(amp: number, off: number, ph = 0) {
  return overviewTs.map((_, i) =>
    Math.min(100, Math.max(0, off + amp * Math.sin((i / COUNT) * Math.PI * 6 + ph) + (Math.random() - 0.5) * 6))
  )
}
function noise(mean: number, spread: number) {
  return overviewTs.map(() => Math.max(0, mean + (Math.random() - 0.5) * spread))
}
function spiky(base: number, spread: number, prob = 0.04) {
  return overviewTs.map(() => {
    const v = base + (Math.random() - 0.5) * spread
    return Math.random() < prob ? v * 4 : v
  })
}

const cpuData:     AlignedData    = [overviewTs, sine(22, 48, 0), sine(18, 35, 1)]
const trafficData: AlignedData    = [overviewTs, spiky(180, 120), spiky(4, 6, 0.05)]
const latencyData: AlignedData    = [overviewTs, noise(42, 14), noise(95, 30), spiky(140, 40, 0.04)]
const overviewData: AlignedData   = [overviewTs, cpuData[1] as number[]]
const overviewSeries: SeriesConfig[] = [{ label: 'CPU', color: '#3b82f6', type: 'area', fillOpacity: 0.2 }]
const cpuSeries: SeriesConfig[] = [
  { label: 'core-0', color: '#3b82f6', type: 'area', fillGradient: true },
  { label: 'core-1', color: '#f59e0b', type: 'area', fillOpacity: 0.12 },
]
const trafficSeries: SeriesConfig[] = [
  { label: 'Requests/s', color: '#10b981', type: 'bars', yAxis: 'left',  barWidth: 0.5 },
  { label: 'Errors/s',   color: '#ef4444', type: 'line', yAxis: 'right', width: 1.5    },
]
const latencySeries: SeriesConfig[] = [
  { label: 'p50', color: '#6366f1', type: 'line', width: 1.5 },
  { label: 'p95', color: '#f59e0b', type: 'line', width: 1.5, dash: [4, 2] },
  { label: 'p99', color: '#ef4444', type: 'line', width: 1.5, dash: [2, 2] },
]

const LATENCIES = Array.from({ length: 3000 }, () => {
  const base = 40 + Math.random() * 120
  return Math.random() < 0.05 ? base + 300 + Math.random() * 400 : base
})

// ── UI primitives ─────────────────────────────────────────────────────────────

function fmtTime(ts: number) {
  const d = new Date(ts * 1000)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function Btn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:      '3px 9px',
        borderRadius: 4,
        border:       'none',
        background:   active ? '#111827' : '#f3f4f6',
        color:        active ? '#fff'    : '#6b7280',
        fontWeight:   active ? 600       : 400,
        fontSize:     '0.75rem',
        cursor:       'pointer',
        transition:   'background 0.1s, color 0.1s',
        whiteSpace:   'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function CtrlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.75rem', color: '#9ca3af', width: 76, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <span style={{
        fontSize: '0.625rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#d1d5db',
      }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
    </div>
  )
}

function ControlPanel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:   '#fafafa',
      border:       '1px solid #e5e7eb',
      borderRadius: 8,
      padding:      '14px 16px',
      display:      'flex',
      flexDirection: 'column',
      gap:          10,
    }}>
      {children}
    </div>
  )
}

function Card({ children, padding = '20px 20px 16px' }: { children: React.ReactNode; padding?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding }}>
      {children}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.625rem', fontWeight: 700, color: '#d1d5db',
      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

// ── Custom legend ─────────────────────────────────────────────────────────────

function CustomLegend({ items }: { items: LegendItem[] }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '4px 6px', fontSize: '0.75rem',
      border: '1px solid #e5e7eb', borderRadius: 4, background: '#fafafa',
    }}>
      <span style={{ color: '#9ca3af', fontWeight: 500 }}>Custom:</span>
      {items.map(item => (
        <span key={item.index} style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: item.visible ? 1 : 0.35 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: item.color }} />
          <strong>{item.label}</strong>
          {item.value != null && (
            <span style={{ color: '#9ca3af' }}>{item.value.toFixed(1)}</span>
          )}
        </span>
      ))}
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ items, timestamp, x, y }: TooltipPayload) {
  const visible = items.filter(i => i.visible && i.value != null)
  if (!visible.length) return null

  const date = timestamp != null ? new Date(timestamp * 1000) : null
  const timeStr = date
    ? `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
    : ''

  return (
    <div style={{
      position:     'absolute',
      left:         x + 14,
      top:          Math.max(0, y - 8),
      background:   '#1f2937',
      color:        '#f9fafb',
      borderRadius: 6,
      padding:      '8px 10px',
      fontSize:     '0.75rem',
      lineHeight:   1.5,
      whiteSpace:   'nowrap',
      boxShadow:    '0 4px 12px rgba(0,0,0,0.25)',
      pointerEvents: 'none',
    }}>
      {timeStr && (
        <div style={{ color: '#9ca3af', marginBottom: 4 }}>{timeStr}</div>
      )}
      {visible.map(item => (
        <div key={item.index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
          <span style={{ color: '#d1d5db' }}>{item.label}</span>
          <span style={{ fontWeight: 600, marginLeft: 'auto', paddingLeft: 12 }}>
            {item.value!.toFixed(1)}{item.unit ? ` ${item.unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Configurator ──────────────────────────────────────────────────────────────
// Options panel on the right, chart on the left

function ConfiguratorDemo() {
  const [legendPosition,  setLegendPosition ] = useState<LegendPosition>('bottom')
  const [legendFormat,    setLegendFormat   ] = useState<LegendFormat>('list')
  const [useCustomLegend, setUseCustomLegend] = useState(false)
  const [useTooltip,      setUseTooltip     ] = useState(false)
  const [showGrid,        setShowGrid       ] = useState(true)
  const [gridDash,        setGridDash       ] = useState<DashPreset>('solid')
  const [gridWidth,       setGridWidth      ] = useState(0.5)
  const [showAxisLine,    setShowAxisLine   ] = useState(true)
  const [axisLineDash,    setAxisLineDash   ] = useState<DashPreset>('solid')
  const [axisLineWidth,   setAxisLineWidth  ] = useState(0.5)
  const [showAxisTicks,   setShowAxisTicks  ] = useState(true)
  const [axisTickWidth,   setAxisTickWidth  ] = useState(0.5)
  const [chartType,       setChartType      ] = useState<ChartType>('area')
  const [fillOpacity,     setFillOpacity    ] = useState(0.15)
  const [fillGradient,    setFillGradient   ] = useState(false)
  const [pointShow,       setPointShow      ] = useState(false)
  const [barWidth,        setBarWidth       ] = useState(0.6)
  const [barStack,        setBarStack       ] = useState(false)
  const [xShowDate,       setXShowDate      ] = useState(true)
  const [locale,          setLocale         ] = useState<string | undefined>(undefined)
  const [selectionMode,   setSelectionMode  ] = useState<SelectionMode>('x')
  const [height,          setHeight         ] = useState(300)
  const [yUnitDisplay,    setYUnitDisplay   ] = useState<'label' | 'tick'>('label')
  const [lastSelection,   setLastSelection  ] = useState('')

  const isArea = chartType === 'area'
  const isBars = chartType === 'bars'
  const isLine = chartType === 'line'

  const activeSeries: SeriesConfig[] = BASE_SERIES.map(s => ({
    ...s,
    type:         chartType,
    fillOpacity:  (isArea || isBars) ? fillOpacity : undefined,
    fillGradient: isArea ? fillGradient : undefined,
    pointShow:    (isLine || isArea) ? pointShow : undefined,
    barWidth:     isBars ? barWidth : undefined,
  }))

  const gridStyle: LineStyle | false = showGrid
    ? { width: gridWidth, dash: DASH_PRESETS[gridDash] }
    : false

  const axisStyle: AxisConfig | false = (!showAxisLine && !showAxisTicks)
    ? false
    : {
        line:  showAxisLine  ? { width: axisLineWidth, dash: DASH_PRESETS[axisLineDash] } : false,
        ticks: showAxisTicks ? { width: axisTickWidth }                                   : false,
      }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: 16, alignItems: 'start' }}>

      {/* ── Left: charts ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <TimeSeriesChart
            data={DEMO_DATA}
            series={activeSeries}
            barStack={barStack}
            height={height}
            legendPosition={legendPosition}
            legendFormat={legendFormat}
            renderLegend={useCustomLegend ? items => <CustomLegend items={items} /> : undefined}
            renderTooltip={useTooltip ? payload => <CustomTooltip {...payload} /> : undefined}
            selectionMode={selectionMode}
            xShowDate={xShowDate}
            locale={locale}
            yUnit="%"
            yUnitDisplay={yUnitDisplay}
            gridStyle={gridStyle}
            axisStyle={axisStyle}
            onSelect={({ timeRange, yRange }) => {
              const parts: string[] = []
              if (timeRange) {
                parts.push(`time: ${new Date(timeRange[0] * 1000).toLocaleTimeString()} → ${new Date(timeRange[1] * 1000).toLocaleTimeString()}`)
              }
              if (yRange) parts.push(`y: ${yRange[0].toFixed(1)} → ${yRange[1].toFixed(1)}`)
              setLastSelection(parts.join('  ·  '))
            }}
          />
        </Card>

        {lastSelection && (
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
            Last selection: <strong style={{ color: '#111827' }}>{lastSelection}</strong>
          </p>
        )}

        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 4px' }}>Dual Y-axis</h2>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 12px' }}>
            Temperature (°C, left) · Humidity (%, right)
          </p>
          <Card>
            <TimeSeriesChart
              data={DUAL_DATA}
              series={DUAL_SERIES}
              height={200}
              yUnit="°C"
              yUnit2="%"
              legendPosition="bottom"
              selectionMode="x"
            />
          </Card>
        </div>
      </div>

      {/* ── Right: options panel ── */}
      <div style={{ position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
        <ControlPanel>
          <SectionDivider title="Legend" />
          <CtrlRow label="Position">
            {LEGEND_POSITIONS.map(p => (
              <Btn key={p} active={legendPosition === p} onClick={() => setLegendPosition(p)}>{p}</Btn>
            ))}
          </CtrlRow>
          <CtrlRow label="Format">
            {LEGEND_FORMATS.map(f => (
              <Btn key={f} active={legendFormat === f} onClick={() => setLegendFormat(f)}>{f}</Btn>
            ))}
            <Btn active={useCustomLegend} onClick={() => setUseCustomLegend(v => !v)}>custom</Btn>
          </CtrlRow>
          <CtrlRow label="Tooltip">
            <Btn active={!useTooltip} onClick={() => setUseTooltip(false)}>off</Btn>
            <Btn active={useTooltip}  onClick={() => setUseTooltip(true)}>custom</Btn>
          </CtrlRow>

          <SectionDivider title="Series" />
          <CtrlRow label="Type">
            {CHART_TYPES.map(t => (
              <Btn key={t} active={chartType === t} onClick={() => setChartType(t)}>{t}</Btn>
            ))}
          </CtrlRow>
          {(isArea || isBars) && (
            <CtrlRow label="Fill opacity">
              {FILL_OPACITIES.map(o => (
                <Btn key={o} active={fillOpacity === o} onClick={() => setFillOpacity(o)}>{o}</Btn>
              ))}
            </CtrlRow>
          )}
          {isArea && (
            <CtrlRow label="Gradient">
              <Btn active={fillGradient}  onClick={() => setFillGradient(true)}>on</Btn>
              <Btn active={!fillGradient} onClick={() => setFillGradient(false)}>off</Btn>
            </CtrlRow>
          )}
          {(isLine || isArea) && (
            <CtrlRow label="Points">
              <Btn active={pointShow}  onClick={() => setPointShow(true)}>on</Btn>
              <Btn active={!pointShow} onClick={() => setPointShow(false)}>off</Btn>
            </CtrlRow>
          )}
          {isBars && (
            <>
              <CtrlRow label="Bar width">
                {BAR_WIDTHS.map(w => (
                  <Btn key={w} active={barWidth === w} onClick={() => setBarWidth(w)}>{w}</Btn>
                ))}
              </CtrlRow>
              <CtrlRow label="Stack">
                <Btn active={barStack}  onClick={() => setBarStack(true)}>on</Btn>
                <Btn active={!barStack} onClick={() => setBarStack(false)}>off</Btn>
              </CtrlRow>
            </>
          )}

          <SectionDivider title="Grid" />
          <CtrlRow label="Show">
            <Btn active={showGrid}  onClick={() => setShowGrid(true)}>on</Btn>
            <Btn active={!showGrid} onClick={() => setShowGrid(false)}>off</Btn>
          </CtrlRow>
          <CtrlRow label="Style">
            {DASH_KEYS.map(d => (
              <Btn key={d} active={gridDash === d} onClick={() => setGridDash(d)}>{d}</Btn>
            ))}
          </CtrlRow>
          <CtrlRow label="Width">
            {LINE_WIDTHS.map(w => (
              <Btn key={w} active={gridWidth === w} onClick={() => setGridWidth(w)}>{w}px</Btn>
            ))}
          </CtrlRow>

          <SectionDivider title="Axis" />
          <CtrlRow label="Line show">
            <Btn active={showAxisLine}  onClick={() => setShowAxisLine(true)}>on</Btn>
            <Btn active={!showAxisLine} onClick={() => setShowAxisLine(false)}>off</Btn>
          </CtrlRow>
          <CtrlRow label="Line style">
            {DASH_KEYS.map(d => (
              <Btn key={d} active={axisLineDash === d} onClick={() => setAxisLineDash(d)}>{d}</Btn>
            ))}
          </CtrlRow>
          <CtrlRow label="Line width">
            {LINE_WIDTHS.map(w => (
              <Btn key={w} active={axisLineWidth === w} onClick={() => setAxisLineWidth(w)}>{w}px</Btn>
            ))}
          </CtrlRow>
          <CtrlRow label="Ticks show">
            <Btn active={showAxisTicks}  onClick={() => setShowAxisTicks(true)}>on</Btn>
            <Btn active={!showAxisTicks} onClick={() => setShowAxisTicks(false)}>off</Btn>
          </CtrlRow>
          <CtrlRow label="Ticks width">
            {LINE_WIDTHS.map(w => (
              <Btn key={w} active={axisTickWidth === w} onClick={() => setAxisTickWidth(w)}>{w}px</Btn>
            ))}
          </CtrlRow>

          <SectionDivider title="X-axis" />
          <CtrlRow label="Show date">
            <Btn active={xShowDate}  onClick={() => setXShowDate(true)}>on</Btn>
            <Btn active={!xShowDate} onClick={() => setXShowDate(false)}>off</Btn>
          </CtrlRow>
          <CtrlRow label="Locale">
            {([undefined, 'en-US', 'ko-KR', 'ja-JP'] as const).map(l => (
              <Btn key={l ?? 'auto'} active={locale === l} onClick={() => setLocale(l)}>
                {l ?? 'auto'}
              </Btn>
            ))}
          </CtrlRow>

          <SectionDivider title="Chart" />
          <CtrlRow label="Selection">
            {SELECTION_MODES.map(m => (
              <Btn key={m} active={selectionMode === m} onClick={() => setSelectionMode(m)}>{m}</Btn>
            ))}
          </CtrlRow>
          <CtrlRow label="Height">
            {[200, 300, 400].map(h => (
              <Btn key={h} active={height === h} onClick={() => setHeight(h)}>{h}px</Btn>
            ))}
          </CtrlRow>
          <CtrlRow label="Y unit">
            <Btn active={yUnitDisplay === 'label'} onClick={() => setYUnitDisplay('label')}>label</Btn>
            <Btn active={yUnitDisplay === 'tick'}  onClick={() => setYUnitDisplay('tick')}>tick</Btn>
          </CtrlRow>
        </ControlPanel>
      </div>
    </div>
  )
}

// ── Linked zoom ───────────────────────────────────────────────────────────────

function LinkedZoomDemo() {
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ControlPanel>
        <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
          Drag on the overview sparkline to zoom all detail charts simultaneously.
        </span>
        {timeRange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: '0.75rem', color: '#1d4ed8',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 4, padding: '2px 8px',
            }}>
              {fmtTime(timeRange[0])} – {fmtTime(timeRange[1])}
            </span>
            <button onClick={() => setTimeRange(null)} style={{
              padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db',
              background: '#fff', cursor: 'pointer', fontSize: '0.8125rem',
            }}>Reset</button>
          </div>
        )}
      </ControlPanel>

      <Card>
        <SectionHeader>Overview — drag to zoom</SectionHeader>
        <TimeSeriesChart
          data={overviewData} series={overviewSeries}
          height={72} axisStyle={false} gridStyle={false}
          legendPosition="none" selectionMode="x"
          onTimeRangeChange={setTimeRange} xShowDate={false}
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <SectionHeader>CPU Usage</SectionHeader>
          <TimeSeriesChart
            data={cpuData} series={cpuSeries}
            height={180} yUnit="%" yMin={0} yMax={100}
            legendPosition="bottom" selectionMode="none"
            timeRange={timeRange ?? undefined}
          />
        </Card>
        <Card>
          <SectionHeader>Latency percentiles</SectionHeader>
          <TimeSeriesChart
            data={latencyData} series={latencySeries}
            height={180} yUnit="ms"
            legendPosition="bottom" selectionMode="none"
            timeRange={timeRange ?? undefined}
          />
        </Card>
      </div>

      <Card>
        <SectionHeader>Traffic (dual axis)</SectionHeader>
        <TimeSeriesChart
          data={trafficData} series={trafficSeries}
          height={160} yUnit="req/s" yUnit2="err/s"
          legendPosition="top" legendFormat="table" selectionMode="none"
          timeRange={timeRange ?? undefined}
        />
      </Card>
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

function generateHeatmapData() {
  const now  = Math.floor(Date.now() / 1000)
  const xs: number[] = []
  const ys: number[] = []
  for (let xi = 0; xi < 60; xi++) {
    const t     = now - (60 - xi) * 60
    const count = 200 + Math.floor(Math.random() * 200)
    for (let i = 0; i < count; i++) {
      const u1 = Math.random(), u2 = Math.random()
      const z  = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      const v  = Math.max(5, 40 + z * 25 + (Math.random() < 0.05 ? 200 + Math.random() * 300 : 0))
      xs.push(t)
      ys.push(v)
    }
  }
  return { xs, ys }
}

const HM_DATA = generateHeatmapData()

const BLUE_FLAME: string[] = [
  'rgb(0,0,128)', 'rgb(0,0,200)', 'rgb(0,80,255)', 'rgb(0,160,255)',
  'rgb(0,220,220)', 'rgb(0,255,160)', 'rgb(80,255,80)', 'rgb(160,255,0)',
  'rgb(220,220,0)', 'rgb(255,160,0)', 'rgb(255,80,0)', 'rgb(255,0,0)',
  'rgb(200,0,0)', 'rgb(140,0,0)', 'rgb(80,0,0)',
]

function HeatmapDemo() {
  const [yBinSize, setYBinSize] = useState(10)
  const [xBinSize, setXBinSize] = useState(60)
  const [palette,  setPalette ] = useState<'metal' | 'flame'>('metal')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ControlPanel>
        <SectionDivider title="Binning" />
        <CtrlRow label="X bin (s)">
          {[30, 60, 120].map(v => (
            <Btn key={v} active={xBinSize === v} onClick={() => setXBinSize(v)}>{v}s</Btn>
          ))}
        </CtrlRow>
        <CtrlRow label="Y bin (ms)">
          {[5, 10, 20, 50].map(v => (
            <Btn key={v} active={yBinSize === v} onClick={() => setYBinSize(v)}>{v}</Btn>
          ))}
        </CtrlRow>
        <SectionDivider title="Palette" />
        <CtrlRow label="Color">
          <Btn active={palette === 'metal'} onClick={() => setPalette('metal')}>metal</Btn>
          <Btn active={palette === 'flame'} onClick={() => setPalette('flame')}>blue flame</Btn>
        </CtrlRow>
      </ControlPanel>

      <Card>
        <SectionHeader>Latency heatmap — {HM_DATA.xs.length.toLocaleString()} points</SectionHeader>
        <HeatmapChart
          xs={HM_DATA.xs}
          ys={HM_DATA.ys}
          xBinSize={xBinSize}
          yBinSize={yBinSize}
          height={340}
          yUnit="ms"
          palette={palette === 'metal' ? GRAD_METAL : BLUE_FLAME}
        />
      </Card>
    </div>
  )
}

// ── Scatter ───────────────────────────────────────────────────────────────────

function generateScatterData() {
  function cluster(cx: number, cy: number, n: number, spread: number) {
    const xs: number[] = [], ys: number[] = []
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2
      const r     = Math.random() * spread
      xs.push(cx + Math.cos(angle) * r + (Math.random() - 0.5) * spread * 0.3)
      ys.push(cy + Math.sin(angle) * r + (Math.random() - 0.5) * spread * 0.3)
    }
    return { xs, ys }
  }
  return {
    a: cluster(30, 40, 300, 12),
    b: cluster(70, 60, 280, 15),
    c: cluster(50, 20, 250, 10),
  }
}

const SC_DATA = generateScatterData()

function ScatterDemo() {
  const [pointSize, setPointSize] = useState(4)

  const series = useMemo<ScatterSeriesConfig[]>(() => [
    { label: 'Cluster A', color: '#3b82f6', ...SC_DATA.a, pointSize },
    { label: 'Cluster B', color: '#ef4444', ...SC_DATA.b, pointSize },
    { label: 'Cluster C', color: '#10b981', ...SC_DATA.c, pointSize },
  ], [pointSize])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ControlPanel>
        <SectionDivider title="Points" />
        <CtrlRow label="Size">
          {[2, 4, 6, 8].map(s => (
            <Btn key={s} active={pointSize === s} onClick={() => setPointSize(s)}>{s}px</Btn>
          ))}
        </CtrlRow>
      </ControlPanel>

      <Card>
        <SectionHeader>Three clusters — {Object.values(SC_DATA).reduce((s, d) => s + d.xs.length, 0).toLocaleString()} points</SectionHeader>
        <ScatterChart series={series} height={340} xUnit="ms" yUnit="mb" />
      </Card>
    </div>
  )
}

// ── Box Plot ──────────────────────────────────────────────────────────────────

function randomBoxStats(base: number, spread: number): BoxStats {
  const vals = Array.from({ length: 100 }, () => base + (Math.random() - 0.5) * spread * 2)
  vals.sort((a, b) => a - b)
  const q1  = vals[24], median = vals[49], q3 = vals[74]
  const iqr = q3 - q1
  const lo  = q1 - iqr * 1.5
  const hi  = q3 + iqr * 1.5
  return {
    min:      vals.find(v => v >= lo) ?? vals[0],
    q1, median, q3,
    max:      [...vals].reverse().find(v => v <= hi) ?? vals[vals.length - 1],
    outliers: vals.filter(v => v < lo || v > hi),
  }
}

const BP_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function generateBoxData(base: number, spread: number): BoxStats[] {
  return BP_CATEGORIES.map((_, i) => randomBoxStats(base + Math.sin(i) * 10, spread))
}

const BP_SERIES: BoxSeriesConfig[] = [
  { label: 'Service A', color: '#3b82f6', data: generateBoxData(80, 40) },
  { label: 'Service B', color: '#f59e0b', data: generateBoxData(100, 50) },
]

function BoxPlotDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <SectionHeader>Response time distribution — 2 services × 6 months</SectionHeader>
        <BoxPlotChart categories={BP_CATEGORIES} series={BP_SERIES} height={300} yUnit="ms" />
      </Card>
    </div>
  )
}

// ── Histogram ─────────────────────────────────────────────────────────────────

function HistogramDemo() {
  const [normalize, setNormalize] = useState(false)
  const [bins,      setBins      ] = useState(30)
  const [color,     setColor     ] = useState('#8b5cf6')

  const COLOR_OPTIONS = [
    { value: '#8b5cf6', label: 'purple' },
    { value: '#3b82f6', label: 'blue'   },
    { value: '#10b981', label: 'green'  },
    { value: '#ef4444', label: 'red'    },
    { value: '#f59e0b', label: 'amber'  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ControlPanel>
        <SectionDivider title="Display" />
        <CtrlRow label="Normalize">
          <Btn active={!normalize} onClick={() => setNormalize(false)}>count</Btn>
          <Btn active={normalize}  onClick={() => setNormalize(true)}>%</Btn>
        </CtrlRow>
        <CtrlRow label="Bins">
          {[15, 30, 50, 80].map(b => (
            <Btn key={b} active={bins === b} onClick={() => setBins(b)}>{b}</Btn>
          ))}
        </CtrlRow>
        <CtrlRow label="Color">
          {COLOR_OPTIONS.map(o => (
            <Btn key={o.value} active={color === o.value} onClick={() => setColor(o.value)}>{o.label}</Btn>
          ))}
        </CtrlRow>
      </ControlPanel>

      <Card>
        <HistogramChart values={LATENCIES} height={260} xUnit="ms" normalize={normalize} bins={bins} color={color} fillOpacity={0.75} />
      </Card>
    </div>
  )
}

// ── Pie / Donut ───────────────────────────────────────────────────────────────

const PIE_SLICES: PieSliceConfig[] = [
  { label: 'Nginx',      value: 42, color: '#3b82f6' },
  { label: 'PostgreSQL', value: 27, color: '#10b981' },
  { label: 'Redis',      value: 13, color: '#f59e0b' },
  { label: 'Worker',     value: 11, color: '#8b5cf6' },
  { label: 'Other',      value:  7, color: '#6b7280' },
]

function PieDemo() {
  const [innerRadius,    setInnerRadius   ] = useState(0.55)
  const [labelType,      setLabelType     ] = useState<PieLabelType>('percent')
  const [labelPosition,  setLabelPosition ] = useState<'inside' | 'outside'>('inside')
  const [legendPosition, setLegendPosition] = useState<'right' | 'bottom' | 'none'>('right')
  const [showCenter,     setShowCenter    ] = useState(true)

  const LABEL_TYPES: PieLabelType[] = ['percent', 'name', 'value', 'name+percent', 'none']
  const total = PIE_SLICES.reduce((s, d) => s + d.value, 0)
  const centerLabel = showCenter && innerRadius > 0 ? `${total}%\nCPU usage` : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ControlPanel>
        <SectionDivider title="Shape" />
        <CtrlRow label="Inner radius">
          {([0, 0.4, 0.55, 0.7] as const).map(r => (
            <Btn key={r} active={innerRadius === r} onClick={() => setInnerRadius(r)}>
              {r === 0 ? 'pie' : r}
            </Btn>
          ))}
        </CtrlRow>
        <SectionDivider title="Labels" />
        <CtrlRow label="Label type">
          {LABEL_TYPES.map(l => (
            <Btn key={l} active={labelType === l} onClick={() => setLabelType(l)}>{l}</Btn>
          ))}
        </CtrlRow>
        <CtrlRow label="Position">
          <Btn active={labelPosition === 'inside'}  onClick={() => setLabelPosition('inside')}>inside</Btn>
          <Btn active={labelPosition === 'outside'} onClick={() => setLabelPosition('outside')}>outside</Btn>
        </CtrlRow>
        {innerRadius > 0 && (
          <CtrlRow label="Center text">
            <Btn active={showCenter}  onClick={() => setShowCenter(true)}>on</Btn>
            <Btn active={!showCenter} onClick={() => setShowCenter(false)}>off</Btn>
          </CtrlRow>
        )}
        <SectionDivider title="Legend" />
        <CtrlRow label="Position">
          {(['right', 'bottom', 'none'] as const).map(p => (
            <Btn key={p} active={legendPosition === p} onClick={() => setLegendPosition(p)}>{p}</Btn>
          ))}
        </CtrlRow>
      </ControlPanel>

      <Card>
        <SectionHeader>CPU usage by service</SectionHeader>
        <PieChart
          slices={PIE_SLICES} height={300}
          innerRadius={innerRadius} labelType={labelType}
          labelPosition={labelPosition} centerLabel={centerLabel}
          legendPosition={legendPosition} unit="%"
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <SectionHeader>Pie (no legend)</SectionHeader>
          <PieChart slices={PIE_SLICES} height={220} innerRadius={0} labelType="name+percent" legendPosition="none" />
        </Card>
        <Card>
          <SectionHeader>Donut — bottom legend</SectionHeader>
          <PieChart slices={PIE_SLICES} height={220} innerRadius={0.6} labelType="none" centerLabel={`${total}%\nTotal`} legendPosition="bottom" />
        </Card>
      </div>
    </div>
  )
}

// ── Stat / Gauge / Bar ────────────────────────────────────────────────────────

const STAT_SPARKLINE = Array.from({ length: 30 }, (_, i) =>
  40 + Math.sin(i / 5) * 15 + Math.random() * 8,
)

const GAUGE_THRESHOLDS: Threshold[] = [
  { value: 0,  color: '#10b981' },
  { value: 60, color: '#f59e0b' },
  { value: 80, color: '#ef4444' },
]

const BAR_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const BAR_SERIES: BarSeriesConfig[] = [
  { label: 'Service A', color: '#3b82f6', values: [42, 55, 38, 61, 49, 70] },
  { label: 'Service B', color: '#10b981', values: [28, 34, 45, 32, 58, 41] },
  { label: 'Service C', color: '#f59e0b', values: [15, 22, 18, 27, 20, 33] },
]

const TS_THRESHOLDS: Threshold[] = [
  { value: 80, color: '#f59e0b', label: 'Warning',  dash: [4, 2] },
  { value: 90, color: '#ef4444', label: 'Critical', width: 1.5  },
]

function NewChartsDemo() {
  const [barStacked,     setBarStacked    ] = useState(false)
  const [barOrientation, setBarOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [gaugeValue,     setGaugeValue    ] = useState(67)
  const [showThresholds, setShowThresholds] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 2px' }}>Stat</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Card padding="0">
          <StatChart value={94.2} unit="%" label="CPU Usage" thresholds={GAUGE_THRESHOLDS} previousValue={78.5} sparkline={STAT_SPARKLINE} height={130} />
        </Card>
        <Card padding="0">
          <StatChart value={1847} unit="req/s" label="Throughput" color="#3b82f6" previousValue={2100} sparkline={STAT_SPARKLINE.map(v => v * 40)} height={130} />
        </Card>
        <Card padding="0">
          <StatChart value={42} unit="ms" label="p50 Latency" thresholds={[{ value: 0, color: '#10b981' }, { value: 100, color: '#ef4444' }]} height={130} />
        </Card>
        <Card padding="0">
          <StatChart value={null} label="No data" height={130} />
        </Card>
      </div>

      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '8px 0 2px' }}>Gauge</h2>
      <ControlPanel>
        <CtrlRow label="Value">
          {[20, 45, 67, 85, 95].map(v => (
            <Btn key={v} active={gaugeValue === v} onClick={() => setGaugeValue(v)}>{v}</Btn>
          ))}
        </CtrlRow>
      </ControlPanel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Card>
          <SectionHeader>CPU Usage</SectionHeader>
          <GaugeChart value={gaugeValue} min={0} max={100} unit="%" thresholds={GAUGE_THRESHOLDS} height={180} />
        </Card>
        <Card>
          <SectionHeader>Memory</SectionHeader>
          <GaugeChart value={gaugeValue * 0.8} min={0} max={100} unit="GB" label="Used / 64 GB" thresholds={GAUGE_THRESHOLDS} arcWidth={0.25} height={180} />
        </Card>
        <Card>
          <SectionHeader>Latency (no thresholds)</SectionHeader>
          <GaugeChart value={gaugeValue * 2} min={0} max={200} unit="ms" height={180} />
        </Card>
      </div>

      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '8px 0 2px' }}>Bar Chart</h2>
      <ControlPanel>
        <CtrlRow label="Orientation">
          <Btn active={barOrientation === 'vertical'}   onClick={() => setBarOrientation('vertical')}>vertical</Btn>
          <Btn active={barOrientation === 'horizontal'} onClick={() => setBarOrientation('horizontal')}>horizontal</Btn>
        </CtrlRow>
        <CtrlRow label="Stack">
          <Btn active={!barStacked} onClick={() => setBarStacked(false)}>grouped</Btn>
          <Btn active={barStacked}  onClick={() => setBarStacked(true)}>stacked</Btn>
        </CtrlRow>
      </ControlPanel>
      <Card>
        <SectionHeader>Response time by service</SectionHeader>
        <BarChart categories={BAR_CATEGORIES} series={BAR_SERIES} orientation={barOrientation} stacked={barStacked} height={280} yUnit="ms" />
      </Card>

      <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '8px 0 2px' }}>Threshold Lines</h2>
      <ControlPanel>
        <CtrlRow label="Show">
          <Btn active={showThresholds}  onClick={() => setShowThresholds(true)}>on</Btn>
          <Btn active={!showThresholds} onClick={() => setShowThresholds(false)}>off</Btn>
        </CtrlRow>
      </ControlPanel>
      <Card>
        <SectionHeader>CPU (warning=80%, critical=90%)</SectionHeader>
        <TimeSeriesChart data={cpuData} series={cpuSeries} height={200} yUnit="%" yMin={0} yMax={100} thresholds={showThresholds ? TS_THRESHOLDS : []} legendPosition="bottom" />
      </Card>
    </div>
  )
}

// ── States ────────────────────────────────────────────────────────────────────

function StatesDemo() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <SectionHeader>Sparkline (axisStyle=false  gridStyle=false  legendPosition="none")</SectionHeader>
        <TimeSeriesChart
          data={cpuData}
          series={[{ label: 'CPU', color: '#3b82f6', type: 'area', fillGradient: true }]}
          height={60} axisStyle={false} gridStyle={false}
          legendPosition="none" selectionMode="none" xShowDate={false}
        />
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionHeader>Loading overlay</SectionHeader>
          <button onClick={() => setIsLoading(v => !v)} style={{
            padding: '4px 12px', borderRadius: 4, border: '1px solid #d1d5db',
            background: '#fff', cursor: 'pointer', fontSize: '0.8125rem',
          }}>
            {isLoading ? 'Hide' : 'Show'} loading
          </button>
        </div>
        <TimeSeriesChart data={cpuData} series={cpuSeries} height={180} yUnit="%" isLoading={isLoading} legendPosition="none" />
      </Card>

      <Card>
        <SectionHeader>Error state</SectionHeader>
        <TimeSeriesChart data={cpuData} series={cpuSeries} height={100} error={new Error('Failed to fetch metrics: connection timeout')} />
      </Card>

      <Card>
        <SectionHeader>Empty histogram</SectionHeader>
        <HistogramChart values={[]} height={100} />
      </Card>
    </div>
  )
}

// ── ChartRenderer (Spec) ──────────────────────────────────────────────────────

const SPEC_TS_BASE  = Math.floor(Date.now() / 1000) - 14 * 60
const SPEC_TS_TIMES = Array.from({ length: 15 }, (_, i) => SPEC_TS_BASE + i * 60)
const SPEC_TS_VALS  = [35, 42, 38, 51, 63, 58, 72, 68, 75, 71, 65, 58, 49, 53, 47]

const SPEC_PRESETS: Record<string, ChartSpec> = {
  bar: {
    type: 'bar',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    series: [
      { label: 'Service A', color: '#3b82f6', values: [42, 55, 38, 61, 49] },
      { label: 'Service B', color: '#10b981', values: [28, 34, 45, 32, 58] },
    ],
    height: 260, yUnit: 'ms',
  },
  pie: {
    type: 'pie',
    slices: [
      { label: 'Nginx',    value: 42, color: '#3b82f6' },
      { label: 'Postgres', value: 27, color: '#10b981' },
      { label: 'Redis',    value: 13, color: '#f59e0b' },
      { label: 'Other',    value: 18, color: '#6b7280' },
    ],
    innerRadius: 0.55, centerLabel: '100%\nCPU', legendPosition: 'right', height: 280,
  },
  timeseries: {
    type: 'timeseries',
    data: [SPEC_TS_TIMES, SPEC_TS_VALS],
    series: [{ label: 'CPU', color: '#3b82f6', type: 'area', fillGradient: true, unit: '%' }],
    height: 260, yUnit: '%', legendPosition: 'bottom',
  },
  gauge: {
    type: 'gauge',
    value: 67, min: 0, max: 100, unit: '%', label: 'CPU Usage',
    thresholds: [{ value: 0, color: '#10b981' }, { value: 60, color: '#f59e0b' }, { value: 80, color: '#ef4444' }],
    height: 220,
  },
  stat: {
    type: 'stat',
    value: 94.2, unit: '%', label: 'CPU Usage', previousValue: 78.5,
    sparkline: [40, 45, 38, 52, 60, 55, 68, 63, 71, 67, 58, 54, 49, 52, 48],
    thresholds: [{ value: 0, color: '#10b981' }, { value: 60, color: '#f59e0b' }, { value: 80, color: '#ef4444' }],
    height: 130,
  },
  histogram: {
    type: 'histogram',
    values: [42,38,51,63,44,37,55,48,61,39,52,47,58,41,36,53,49,66,45,40,57,43,50,62,35,54,46,59,33,65,48,72,38,44,380,420,350,410,55,61,37,49,42,58,63,47,51,39,68,44,56,40,53],
    bins: 15, color: '#8b5cf6', height: 260, xUnit: 'ms',
  },
  scatter: {
    type: 'scatter',
    series: [
      { label: 'Group A', color: '#3b82f6', xs: [22,25,28,31,26,23,29,27,24,30,28,25], ys: [38,42,35,48,41,39,45,43,37,46,40,44] },
      { label: 'Group B', color: '#ef4444', xs: [62,65,68,71,66,63,69,67,64,70,68,65], ys: [58,62,55,68,61,59,65,63,57,66,60,64] },
    ],
    height: 260, xUnit: 'ms', yUnit: 'mb',
  },
  boxplot: {
    type: 'boxplot',
    categories: ['Jan', 'Feb', 'Mar'],
    series: [{
      label: 'Service A', color: '#3b82f6',
      data: [
        { min: 20, q1: 35, median: 48, q3: 62, max: 80 },
        { min: 18, q1: 32, median: 45, q3: 58, max: 85 },
        { min: 25, q1: 40, median: 55, q3: 70, max: 90 },
      ],
    }],
    height: 260, yUnit: 'ms',
  },
}

const VALID_SPEC_TYPES = new Set([
  'bar','pie','scatter','timeseries','histogram','boxplot','gauge','stat','heatmap',
])

const LLM_CODE: Record<string, string> = {
  tool: `\
import Anthropic from '@anthropic-ai/sdk'
import { CHART_SPEC_SCHEMA } from '@loykin/chartkit'
import type { ChartSpec } from '@loykin/chartkit'

const client = new Anthropic()

async function askForChart(userMessage: string): Promise<ChartSpec> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [{
      name: 'render_chart',
      description: 'Render a data visualization chart',
      input_schema: CHART_SPEC_SCHEMA,
    }],
    tool_choice: { type: 'any' },   // force the model to call the tool
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = response.content.find(b => b.type === 'tool_use')
  return block!.input as ChartSpec  // guaranteed to match ChartSpec schema
}

// Usage
const spec = await askForChart('Show last month response times by service as a bar chart')
// → <ChartRenderer spec={spec} />`,

  prompt: `\
import Anthropic from '@anthropic-ai/sdk'
import { CHART_SPEC_DESCRIPTION } from '@loykin/chartkit'
import type { ChartSpec } from '@loykin/chartkit'

const client = new Anthropic()

async function askForChart(userMessage: string): Promise<ChartSpec> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      'When asked to visualize data, respond with a ChartSpec JSON object only.',
      'No explanation, no markdown fences — raw JSON only.',
      '',
      CHART_SPEC_DESCRIPTION,
    ].join('\\n'),
    messages: [{ role: 'user', content: userMessage }],
  })

  return JSON.parse(response.content[0].text) as ChartSpec
}

// Usage
const spec = await askForChart('Show last month response times by service as a bar chart')
// → <ChartRenderer spec={spec} />`,

  mcp: `\
// MCP server (Node.js) — one tool, zero React knowledge required on the agent side
import { CHART_SPEC_SCHEMA } from '@loykin/chartkit'

export const tools = [
  {
    name: 'render_chart',
    description: 'Render a data visualization chart in the UI',
    inputSchema: CHART_SPEC_SCHEMA,   // full JSON Schema — model validates against it
  },
]

// When the agent calls render_chart(spec), pass spec to <ChartRenderer spec={spec} />
// The agent never needs to know what React component renders it.`,
}

function SpecDemo() {
  const presetKeys = Object.keys(SPEC_PRESETS)
  const [activePreset, setActivePreset] = useState('bar')
  const [jsonText,     setJsonText    ] = useState(() => JSON.stringify(SPEC_PRESETS.bar, null, 2))
  const [parseError,   setParseError  ] = useState<string | null>(null)
  const [liveSpec,     setLiveSpec    ] = useState<ChartSpec>(SPEC_PRESETS.bar)
  const [llmTab,       setLlmTab      ] = useState<'tool' | 'prompt' | 'mcp'>('tool')

  function loadPreset(key: string) {
    const spec = SPEC_PRESETS[key]
    setActivePreset(key)
    setJsonText(JSON.stringify(spec, null, 2))
    setLiveSpec(spec)
    setParseError(null)
  }

  function handleEdit(value: string) {
    setJsonText(value)
    try {
      setLiveSpec(JSON.parse(value) as ChartSpec)
      setParseError(null)
    } catch {
      setParseError('Invalid JSON')
    }
  }

  const typeOk = !parseError && VALID_SPEC_TYPES.has((liveSpec as { type?: string })?.type ?? '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Why this exists */}
      <div style={{
        background: '#f8faff', border: '1px solid #dbeafe',
        borderRadius: 8, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e40af' }}>
          AI & Agent Interface
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6 }}>
          AI agents can reliably generate <strong>JSON</strong>, but writing React component code is error-prone —
          import paths change, prop names drift, and there's no easy validation.
          <br />
          <code style={{ background: '#e0e7ff', borderRadius: 3, padding: '1px 5px', fontSize: '0.75rem' }}>ChartSpec</code> is
          a typed JSON schema that describes <em>what</em> to render.{' '}
          <code style={{ background: '#e0e7ff', borderRadius: 3, padding: '1px 5px', fontSize: '0.75rem' }}>{'<ChartRenderer spec={...} />'}</code> turns it into the right component.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
          {[
            { label: 'MCP tool',        desc: 'Pass CHART_SPEC_SCHEMA as the input schema for a render_chart tool' },
            { label: 'LLM function call', desc: 'Use CHART_SPEC_DESCRIPTION in the system prompt — the model outputs valid specs' },
            { label: 'Backend-driven',  desc: 'Any service that outputs JSON can drive charts without a React dependency' },
          ].map(({ label, desc }) => (
            <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', minWidth: 200, flex: 1 }}>
              <span style={{
                marginTop: 2, width: 6, height: 6, borderRadius: '50%',
                background: '#3b82f6', flexShrink: 0,
              }} />
              <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.5 }}>
                <strong style={{ color: '#111827' }}>{label}</strong> — {desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LLM request examples */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', flex: 1 }}>
            LLM에서 ChartSpec 요청하기
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <Btn active={llmTab === 'tool'}   onClick={() => setLlmTab('tool')}>Tool use</Btn>
            <Btn active={llmTab === 'prompt'} onClick={() => setLlmTab('prompt')}>System prompt</Btn>
            <Btn active={llmTab === 'mcp'}    onClick={() => setLlmTab('mcp')}>MCP server</Btn>
          </div>
        </div>
        <CodeMirror
          value={LLM_CODE[llmTab]}
          extensions={[javascript({ typescript: true })]}
          theme={oneDark}
          editable={false}
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false }}
        />
      </div>

      <ControlPanel>
        <CtrlRow label="Preset">
          {presetKeys.map(key => (
            <Btn key={key} active={activePreset === key} onClick={() => loadPreset(key)}>{key}</Btn>
          ))}
        </CtrlRow>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Edit the JSON on the left — the chart on the right updates live.
        </div>
      </ControlPanel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
        <div>
          <SectionHeader>ChartSpec JSON</SectionHeader>
          <div style={{
            border: parseError ? '1px solid #ef4444' : '1px solid #e5e7eb',
            borderRadius: 6,
            overflow: 'hidden',
            fontSize: '0.72rem',
          }}>
            <CodeMirror
              value={jsonText}
              onChange={handleEdit}
              extensions={[jsonLang()]}
              theme={oneDark}
              height="360px"
            />
          </div>
          {parseError && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0' }}>{parseError}</p>
          )}
        </div>

        <div>
          <SectionHeader>Live preview — &lt;ChartRenderer spec={'{...}'} /&gt;</SectionHeader>
          <Card>
            {typeOk ? (
              <ChartRenderer spec={liveSpec} />
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>
                {parseError ? 'Fix JSON to see preview' : `Unknown type: "${(liveSpec as { type?: string })?.type}"`}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar navigation ────────────────────────────────────────────────────────

type DemoId =
  | 'configurator' | 'zoom'
  | 'heatmap' | 'scatter' | 'boxplot' | 'histogram' | 'pie' | 'new'
  | 'states' | 'spec'

const NAV: { group: string; items: { id: DemoId; label: string }[] }[] = [
  {
    group: 'Time Series',
    items: [
      { id: 'configurator', label: 'Configurator' },
      { id: 'zoom',         label: 'Linked Zoom'  },
    ],
  },
  {
    group: 'Charts',
    items: [
      { id: 'heatmap',   label: 'Heatmap'          },
      { id: 'scatter',   label: 'Scatter'           },
      { id: 'boxplot',   label: 'Box Plot'          },
      { id: 'histogram', label: 'Histogram'         },
      { id: 'pie',       label: 'Pie / Donut'       },
      { id: 'new',       label: 'Stat / Gauge / Bar'},
    ],
  },
  {
    group: 'Developer',
    items: [
      { id: 'states', label: 'States'        },
      { id: 'spec',   label: 'ChartRenderer' },
    ],
  },
]

function AppSidebar({ activeId, onSelect }: { activeId: DemoId; onSelect: (id: DemoId) => void }) {
  return (
    <aside style={{
      width: 212,
      flexShrink: 0,
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: '#111827', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
          }}>CK</div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>ChartKit</div>
            <div style={{ fontSize: '0.6875rem', color: '#9ca3af', lineHeight: 1.2 }}>Playground</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#9ca3af', padding: '6px 10px 4px',
            }}>
              {group.group}
            </div>
            {group.items.map(item => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  style={{
                    width: '100%', display: 'block', textAlign: 'left',
                    padding: '6px 10px', borderRadius: 6, border: 'none',
                    background: isActive ? '#f3f4f6' : 'transparent',
                    color:      isActive ? '#111827' : '#6b7280',
                    fontWeight: isActive ? 600 : 400,
                    fontSize:   '0.8125rem',
                    cursor:     'pointer',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '0.6875rem', color: '#d1d5db' }}>@loykin/chartkit · {N} pts</div>
      </div>
    </aside>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeId, setActiveId] = useState<DemoId>('configurator')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f9fafb' }}>
      <AppSidebar activeId={activeId} onSelect={setActiveId} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '24px' }}>
          {activeId === 'configurator' && <ConfiguratorDemo />}
          {activeId === 'zoom'         && <LinkedZoomDemo />}
          {activeId === 'heatmap'      && <HeatmapDemo />}
          {activeId === 'scatter'      && <ScatterDemo />}
          {activeId === 'boxplot'      && <BoxPlotDemo />}
          {activeId === 'histogram'    && <HistogramDemo />}
          {activeId === 'pie'          && <PieDemo />}
          {activeId === 'new'          && <NewChartsDemo />}
          {activeId === 'states'       && <StatesDemo />}
          {activeId === 'spec'         && <SpecDemo />}
        </div>
      </main>
    </div>
  )
}
