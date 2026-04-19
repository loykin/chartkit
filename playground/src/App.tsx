import { useState, useMemo } from 'react'
import { TimeSeriesChart, HistogramChart, HeatmapChart, ScatterChart, BoxPlotChart, GRAD_METAL } from '@loykin/chartkit'
import type {
  AlignedData, SeriesConfig, AxisConfig, LineStyle,
  LegendPosition, LegendFormat, LegendItem, SelectionMode, TooltipPayload,
  ScatterSeriesConfig, BoxSeriesConfig, BoxStats,
} from '@loykin/chartkit'

// ── Demo data ─────────────────────────────────────────────────────────────────

const STEP = 60
const N    = 120

const midnight = new Date()
midnight.setHours(0, 0, 0, 0)
const DEMO_START = Math.floor(midnight.getTime() / 1000) - 60 * 60  // 23:00 yesterday

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

// Overview / linked-zoom data
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
      <span style={{ fontSize: '0.75rem', color: '#9ca3af', width: 88, flexShrink: 0 }}>{label}</span>
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

// ── Custom legend example ─────────────────────────────────────────────────────

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

// ── Custom tooltip example ────────────────────────────────────────────────────

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

// ── Tab 1: Configurator ───────────────────────────────────────────────────────

function ConfiguratorDemo() {
  // Legend
  const [legendPosition,  setLegendPosition ] = useState<LegendPosition>('bottom')
  const [legendFormat,    setLegendFormat   ] = useState<LegendFormat>('list')
  const [useCustomLegend, setUseCustomLegend] = useState(false)
  const [useTooltip,      setUseTooltip     ] = useState(false)

  // Grid
  const [showGrid,  setShowGrid ] = useState(true)
  const [gridDash,  setGridDash ] = useState<DashPreset>('solid')
  const [gridWidth, setGridWidth] = useState(0.5)

  // Axis
  const [showAxisLine,  setShowAxisLine ] = useState(true)
  const [axisLineDash,  setAxisLineDash ] = useState<DashPreset>('solid')
  const [axisLineWidth, setAxisLineWidth] = useState(0.5)
  const [showAxisTicks, setShowAxisTicks] = useState(true)
  const [axisTickWidth, setAxisTickWidth] = useState(0.5)

  // Series
  const [chartType,    setChartType   ] = useState<ChartType>('area')
  const [fillOpacity,  setFillOpacity ] = useState(0.15)
  const [fillGradient, setFillGradient] = useState(false)
  const [pointShow,    setPointShow   ] = useState(false)
  const [barWidth,     setBarWidth    ] = useState(0.6)
  const [barStack,     setBarStack    ] = useState(false)

  // X-axis
  const [xShowDate, setXShowDate] = useState(true)
  const [locale,    setLocale   ] = useState<string | undefined>(undefined)

  // Chart
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('x')
  const [height,        setHeight       ] = useState(300)
  const [yUnitDisplay,  setYUnitDisplay ] = useState<'label' | 'tick'>('label')
  const [lastSelection, setLastSelection] = useState('')

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      {/* Dual Y-axis */}
      <div style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 4px' }}>Dual Y-axis</h2>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 12px' }}>
          Temperature (°C, left) · Humidity (%, right) — each series bound to its own scale
        </p>
        <Card>
          <TimeSeriesChart
            data={DUAL_DATA}
            series={DUAL_SERIES}
            height={260}
            yUnit="°C"
            yUnit2="%"
            legendPosition="bottom"
            selectionMode="x"
          />
        </Card>
      </div>
    </div>
  )
}

// ── Tab 2: Linked zoom ────────────────────────────────────────────────────────

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

// ── Tab 3: Heatmap ────────────────────────────────────────────────────────────

function generateHeatmapData() {
  const now  = Math.floor(Date.now() / 1000)
  const xs: number[] = []
  const ys: number[] = []
  // 60 x-buckets × ~300 points each ≈ 18k points
  for (let xi = 0; xi < 60; xi++) {
    const t     = now - (60 - xi) * 60
    const count = 200 + Math.floor(Math.random() * 200)
    for (let i = 0; i < count; i++) {
      // skewed-normal-ish latency distribution
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
  'rgb(0,0,128)',
  'rgb(0,0,200)',
  'rgb(0,80,255)',
  'rgb(0,160,255)',
  'rgb(0,220,220)',
  'rgb(0,255,160)',
  'rgb(80,255,80)',
  'rgb(160,255,0)',
  'rgb(220,220,0)',
  'rgb(255,160,0)',
  'rgb(255,80,0)',
  'rgb(255,0,0)',
  'rgb(200,0,0)',
  'rgb(140,0,0)',
  'rgb(80,0,0)',
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

// ── Tab 4: Scatter ────────────────────────────────────────────────────────────

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

// ── Tab 5: Box Plot ───────────────────────────────────────────────────────────

function randomBoxStats(base: number, spread: number): BoxStats {
  const vals = Array.from({ length: 100 }, () => base + (Math.random() - 0.5) * spread * 2)
  vals.sort((a, b) => a - b)
  const q1  = vals[24], median = vals[49], q3 = vals[74]
  const iqr = q3 - q1
  const lo  = q1 - iqr * 1.5
  const hi  = q3 + iqr * 1.5
  return {
    min:      vals.find(v => v >= lo) ?? vals[0],
    q1,
    median,
    q3,
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
        <BoxPlotChart
          categories={BP_CATEGORIES}
          series={BP_SERIES}
          height={300}
          yUnit="ms"
        />
      </Card>
    </div>
  )
}

// ── Tab 6: Histogram ──────────────────────────────────────────────────────────

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

// ── Tab 4: States ─────────────────────────────────────────────────────────────

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
        <TimeSeriesChart
          data={cpuData} series={cpuSeries} height={100}
          error={new Error('Failed to fetch metrics: connection timeout')}
        />
      </Card>

      <Card>
        <SectionHeader>Empty histogram</SectionHeader>
        <HistogramChart values={[]} height={100} />
      </Card>
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'configurator', label: 'Configurator'  },
  { id: 'zoom',         label: 'Linked zoom'   },
  { id: 'heatmap',      label: 'Heatmap'       },
  { id: 'scatter',      label: 'Scatter'       },
  { id: 'boxplot',      label: 'Box Plot'      },
  { id: 'histogram',    label: 'Histogram'     },
  { id: 'states',       label: 'States'        },
] as const

type TabId = typeof TABS[number]['id']

export default function App() {
  const [tab, setTab] = useState<TabId>('configurator')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>ChartKit Playground</h1>
      <p style={{ color: '#6b7280', fontSize: '0.8125rem', margin: '0 0 22px' }}>
        @loykin/chartkit — uPlot-based chart component library · {N} data points
      </p>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24, gap: 2 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: tab === t.id ? '2px solid #111827' : '2px solid transparent',
              color:    tab === t.id ? '#111827' : '#9ca3af',
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: '0.875rem', cursor: 'pointer', marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'configurator' && <ConfiguratorDemo />}
      {tab === 'zoom'         && <LinkedZoomDemo />}
      {tab === 'heatmap'      && <HeatmapDemo />}
      {tab === 'scatter'      && <ScatterDemo />}
      {tab === 'boxplot'      && <BoxPlotDemo />}
      {tab === 'histogram'    && <HistogramDemo />}
      {tab === 'states'       && <StatesDemo />}
    </div>
  )
}
