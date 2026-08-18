'use client'

import { useMemo } from 'react'
import { Search, MapPin, ArrowRightLeft, PackageCheck, ShieldCheck, Radio } from 'lucide-react'
import { usePersistentState } from '@/lib/use-persistent-state'
import { classify } from '@/lib/mad-routing'
import { Panel, Field, TextInput } from './panel'
import { ActionButton } from './action-button'
import { cn } from '@/lib/utils'

type EntityType = 'peer' | 'node' | 'manufacturer' | 'service'

type Entity = {
  id: string
  name: string
  type: EntityType
  materials: string[]
  distance: number
}

const TYPE_META: Record<EntityType, { label: string; short: string; action: string }> = {
  peer: { label: 'Neighbors / Peer-to-Peer', short: 'PEER', action: 'Request Transfer' },
  node: { label: 'Drop-Off Nodes', short: 'NODE', action: 'Log Drop-Off' },
  manufacturer: { label: 'Certified Manufacturers', short: 'MFG', action: 'Request Transfer' },
  service: { label: 'Service Providers', short: 'SVC', action: 'Request Transfer' },
}

const NETWORK: Entity[] = [
  { id: 'n42', name: 'Node #42 — Miller Homestead', type: 'peer', materials: ['Cement blocks', 'Salvaged windows', 'Steel rebar'], distance: 1.4 },
  { id: 'aero', name: 'AeroCraft Salvage', type: 'manufacturer', materials: ['Aluminum sheet', 'Glass panes', 'Sealant kits'], distance: 3.8 },
  { id: 'n17', name: 'Node #17 — Ortega Ranch', type: 'peer', materials: ['Used tires', 'Straw bales', 'Cardboard'], distance: 2.1 },
  { id: 'dropA', name: 'Depot A — County Transfer Yard', type: 'node', materials: ['Concrete rubble', 'Brick', 'Timber offcuts'], distance: 0.9 },
  { id: 'weave', name: 'FieldWeave Textiles Co-Op', type: 'manufacturer', materials: ['Canvas webbing', 'Nylon thread', 'Buckles'], distance: 5.2 },
  { id: 'haul', name: 'BackHaul Logistics', type: 'service', materials: ['Flatbed transport', 'Crane lift', 'Bulk haul'], distance: 6.7 },
  { id: 'n08', name: 'Node #08 — Vasquez Plot', type: 'peer', materials: ['Egg crates', 'Compost media', 'Glass bottles'], distance: 3.3 },
  { id: 'dropB', name: 'Depot B — Maker Drop Hub', type: 'node', materials: ['Plywood boards', 'Pallets', 'Sawdust'], distance: 1.8 },
  { id: 'weld', name: 'IronLine Mobile Welding', type: 'service', materials: ['On-site welding', 'Cut & fab', 'Anchor sets'], distance: 4.5 },
]

const FILTERS: EntityType[] = ['peer', 'node', 'manufacturer', 'service']

export function ModuleExchange({ disabled }: { disabled: boolean }) {
  const [query, setQuery] = usePersistentState<string>('mad.exchange.query', '')
  const [active, setActive] = usePersistentState<EntityType[]>('mad.exchange.filters', [...FILTERS])
  const [log, setLog] = usePersistentState<Record<string, string>>('mad.exchange.log', {})

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return NETWORK.filter((e) => {
      if (!active.includes(e.type)) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.materials.some((m) => m.toLowerCase().includes(q))
      )
    }).sort((a, b) => a.distance - b.distance)
  }, [query, active])

  function toggleFilter(t: EntityType) {
    setActive((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function handleAction(e: Entity) {
    const verb = e.type === 'node' ? 'Drop-off logged to' : 'Transfer requested from'
    setLog((prev) => ({ ...prev, [e.id]: `${verb} ${e.name} · ${new Date().toLocaleTimeString()}` }))
  }

  return (
    <Panel title="Local Material Exchange & Neighbor Network" code="MOD-04">
      {/* Search & filter bar */}
      <div className="flex flex-col gap-4">
        <Field label="Network Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled}
              placeholder="Search materials — cement blocks, glass, egg crates…"
              className="pl-9"
            />
          </div>
        </Field>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Entity filters">
          {FILTERS.map((t) => {
            const on = active.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleFilter(t)}
                disabled={disabled}
                aria-pressed={on}
                className={cn(
                  'flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  on
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 border',
                    on ? 'border-primary bg-primary' : 'border-muted-foreground',
                  )}
                  aria-hidden
                />
                {TYPE_META[t].label}
              </button>
            )
          })}
        </div>

        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {results.length} match{results.length === 1 ? '' : 'es'} within network range
        </p>
      </div>

      {/* Resource matcher cards */}
      <div className="mt-4 grid gap-3">
        {results.length === 0 && (
          <div className="border border-border bg-card px-4 py-6 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              No entities match the current search &amp; filters.
            </p>
          </div>
        )}

        {results.map((e) => {
          const meta = TYPE_META[e.type]
          // Protocol routing derived from the first material's functional domain.
          const routed = classify(e.materials[0])
          const logged = log[e.id]
          const isService = e.type === 'service'
          return (
            <div
              key={e.id}
              className="border border-l-2 border-border border-l-primary bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <EntityIcon type={e.type} />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                      {e.name}
                    </h3>
                  </div>
                  <span className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-primary">
                    {meta.short}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {e.distance.toFixed(1)} miles away
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {isService ? 'Services Offered' : 'Available Materials'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {e.materials.map((m) => (
                    <span
                      key={m}
                      className="border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Protocol routing note */}
              {!isService && (
                <div className="mt-3 flex gap-2 border border-primary/40 bg-primary/10 p-2.5">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <p className="font-mono text-[10px] leading-relaxed text-foreground">
                    <span className="text-primary">Secure route:</span> {e.materials[0]} crosses into{' '}
                    <span className="font-semibold">{routed.domain}</span>
                    {routed.key !== 'triage'
                      ? ' — matches phase requirement and routes directly to that assembly stage.'
                      : ' — no phase match; hold in triage queue pending manual classification.'}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3">
                <ActionButton
                  onClick={() => handleAction(e)}
                  disabled={disabled}
                  icon={
                    e.type === 'node' ? (
                      <PackageCheck className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {meta.action}
                </ActionButton>
                {logged && (
                  <span className="truncate font-mono text-[10px] text-success" title={logged}>
                    {logged}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function EntityIcon({ type }: { type: EntityType }) {
  const cls = 'h-4 w-4 text-primary'
  if (type === 'node') return <PackageCheck className={cls} aria-hidden />
  if (type === 'manufacturer') return <ShieldCheck className={cls} aria-hidden />
  if (type === 'service') return <Radio className={cls} aria-hidden />
  return <ArrowRightLeft className={cls} aria-hidden />
}
