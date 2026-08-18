'use client'

import { useMemo, useState } from 'react'
import { Activity, Layers, Waves, Zap } from 'lucide-react'
import { usePersistentState } from '@/lib/use-persistent-state'
import type { Coordinates, ZoningItem } from '@/lib/mad-types'
import { Panel, Field, TextInput } from './panel'
import { ActionButton } from './action-button'
import { cn } from '@/lib/utils'

const DEFAULT_COORDS: Coordinates = { lat: '', lng: '', elevation: '', waterTable: '' }

const DEFAULT_ZONING: ZoningItem[] = [
  { id: 'setback', label: 'Property setback clearances verified', done: false },
  { id: 'permit', label: 'Owner-builder permit pathway identified', done: false },
  { id: 'septic', label: 'Septic / greywater feasibility reviewed', done: false },
  { id: 'access', label: 'Legal road access & easements confirmed', done: false },
  { id: 'fire', label: 'Wildfire defensible-space zone mapped', done: false },
  { id: 'utility', label: '811 utility marking scheduled (real world)', done: false },
]

type SimResult = {
  layers: { name: string; depth: string; note: string }[]
  overlays: { name: string; status: string }[]
  stamp: string
}

function hashNum(str: string, min: number, max: number) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return min + (h % Math.max(1, max - min + 1))
}

export function ModuleProperty({ disabled }: { disabled: boolean }) {
  const [coords, setCoords] = usePersistentState<Coordinates>('mad.coords', DEFAULT_COORDS)
  const [zoning, setZoning] = usePersistentState<ZoningItem[]>('mad.zoning', DEFAULT_ZONING)
  const [sim, setSim] = usePersistentState<SimResult | null>('mad.sim', null)
  const [log, setLog] = usePersistentState<string[]>('mad.sim.log', [])
  const [running, setRunning] = useState(false)

  const seed = `${coords.lat}${coords.lng}${coords.elevation}${coords.waterTable}`
  const completed = useMemo(() => zoning.filter((z) => z.done).length, [zoning])

  function pushLog(line: string) {
    const t = new Date().toLocaleTimeString([], { hour12: false })
    setLog((prev) => [`[${t}] ${line}`, ...prev].slice(0, 40))
  }

  function runSimulation() {
    setRunning(true)
    pushLog('Initializing topographical solver…')
    const wt = Number(coords.waterTable) || hashNum(seed || 'x', 4, 30)
    const el = Number(coords.elevation) || hashNum(seed || 'y', 200, 1800)
    setTimeout(() => {
      const result: SimResult = {
        stamp: new Date().toLocaleString(),
        layers: [
          { name: 'Topsoil / Organic', depth: '0–0.4m', note: 'Strip & stockpile for berms' },
          { name: 'Clay Loam Subgrade', depth: `0.4–${(1.2).toFixed(1)}m`, note: 'Bearing candidate' },
          { name: 'Weathered Bedrock', depth: `${(1.2).toFixed(1)}–${(2.6).toFixed(1)}m`, note: 'Anchor zone' },
          { name: 'Water Table', depth: `~${wt}m`, note: wt < 8 ? 'Shallow — drainage critical' : 'Nominal' },
        ],
        overlays: [
          { name: 'Simulated Power Corridor', status: `~${hashNum(seed || 'p', 20, 180)}m to tie-in` },
          { name: 'Simulated Water Main', status: hashNum(seed || 'w', 0, 1) ? 'None detected — well advised' : `~${hashNum(seed || 'w2', 30, 220)}m` },
          { name: 'Grade / Slope Vector', status: `${hashNum(seed || 's', 1, 14)}% avg fall` },
          { name: 'Elevation Reference', status: `${el} m ASL` },
        ],
      }
      setSim(result)
      pushLog(`Solve complete — water table ~${wt}m, elevation ${el}m ASL.`)
      pushLog('Overlays are simulated visual aids — verify via 811 & licensed survey.')
      setRunning(false)
    }, 700)
  }

  function toggleZoning(id: string) {
    setZoning((prev) => prev.map((z) => (z.id === id ? { ...z, done: !z.done } : z)))
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <Panel title="Site Parameters" code="MOD-01">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <TextInput
                value={coords.lat}
                onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                placeholder="41.7325"
                inputMode="decimal"
              />
            </Field>
            <Field label="Longitude">
              <TextInput
                value={coords.lng}
                onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                placeholder="-122.5266"
                inputMode="decimal"
              />
            </Field>
            <Field label="Elevation" hint="m ASL">
              <TextInput
                value={coords.elevation}
                onChange={(e) => setCoords({ ...coords, elevation: e.target.value })}
                placeholder="820"
                inputMode="numeric"
              />
            </Field>
            <Field label="Water Table" hint="m depth">
              <TextInput
                value={coords.waterTable}
                onChange={(e) => setCoords({ ...coords, waterTable: e.target.value })}
                placeholder="12"
                inputMode="numeric"
              />
            </Field>
          </div>
          <div className="mt-4">
            <ActionButton
              onClick={runSimulation}
              disabled={disabled || running}
              icon={<Activity className={cn('h-3.5 w-3.5', running && 'animate-pulse')} />}
              className="w-full"
            >
              {running ? 'Solving…' : 'Run Site Simulation'}
            </ActionButton>
          </div>
        </Panel>

        <Panel title="Status Log" code="STDOUT">
          <div className="mad-grid-fine max-h-56 overflow-auto border border-border bg-background/60 p-3">
            {log.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground">
                {'>'} awaiting simulation input…
              </p>
            ) : (
              <ul className="space-y-1">
                {log.map((line, i) => (
                  <li
                    key={i}
                    className={cn(
                      'font-mono text-[11px] leading-relaxed',
                      i === 0 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-5">
        <Panel
          title="Topographical Layers"
          code="Z-DEPTH"
          action={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
        >
          {!sim ? (
            <EmptyState label="Run a simulation to render strata" />
          ) : (
            <div className="space-y-2">
              {sim.layers.map((layer, i) => (
                <div
                  key={layer.name}
                  className="flex items-center gap-3 border border-border bg-background/50 p-2.5"
                >
                  <span
                    className="h-8 w-1 shrink-0"
                    style={{ backgroundColor: `oklch(0.7 0.19 ${45 + i * 30})` }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-foreground">{layer.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{layer.note}</p>
                  </div>
                  <span className="font-mono text-[11px] text-primary">{layer.depth}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Utility Overlays"
          code="SIM"
          action={<Zap className="h-3.5 w-3.5 text-muted-foreground" />}
        >
          {!sim ? (
            <EmptyState label="No overlay data" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {sim.overlays.map((o) => (
                <div key={o.name} className="border border-border bg-background/50 p-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {o.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-foreground">{o.status}</p>
                </div>
              ))}
              <p className="col-span-2 flex items-center gap-1.5 font-mono text-[10px] text-warning">
                <Waves className="h-3 w-3" aria-hidden /> Simulated aid only — not a survey.
              </p>
            </div>
          )}
        </Panel>

        <Panel
          title="Zoning Compliance Checklist"
          code={`${completed}/${zoning.length}`}
        >
          <ul className="space-y-1.5">
            {zoning.map((z) => (
              <li key={z.id}>
                <button
                  type="button"
                  onClick={() => toggleZoning(z.id)}
                  className={cn(
                    'flex w-full items-center gap-3 border p-2.5 text-left transition-colors',
                    z.done
                      ? 'border-success/50 bg-success/10'
                      : 'border-border bg-background/50 hover:border-primary/60',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[10px]',
                      z.done
                        ? 'border-success bg-success text-background'
                        : 'border-muted-foreground text-transparent',
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span
                    className={cn(
                      'font-mono text-xs',
                      z.done ? 'text-foreground line-through decoration-success/60' : 'text-foreground',
                    )}
                  >
                    {z.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mad-grid flex h-24 items-center justify-center border border-dashed border-border bg-background/30">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
