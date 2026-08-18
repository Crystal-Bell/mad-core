'use client'

import { useMemo } from 'react'
import { CheckCircle2, Lock, Cpu, Scissors, Bot, Flame, Hammer } from 'lucide-react'
import type { ReactNode } from 'react'
import { usePersistentState } from '@/lib/use-persistent-state'
import { detectDomains, type DomainKey } from '@/lib/mad-routing'
import { Panel } from './panel'
import { cn } from '@/lib/utils'

type ToolKey = 'printer' | 'sewing' | 'cnc' | 'welding' | 'hand'

type Equipment = { key: ToolKey; label: string; icon: ReactNode }

const EQUIPMENT: Equipment[] = [
  { key: 'printer', label: '3D Printer', icon: <Cpu className="h-4 w-4" aria-hidden /> },
  { key: 'sewing', label: 'Sewing / Textile Machine', icon: <Scissors className="h-4 w-4" aria-hidden /> },
  { key: 'cnc', label: 'CNC / Laser Cutter', icon: <Bot className="h-4 w-4" aria-hidden /> },
  { key: 'welding', label: 'Welding & Metal Rig', icon: <Flame className="h-4 w-4" aria-hidden /> },
  { key: 'hand', label: 'Basic Hand Tools Only', icon: <Hammer className="h-4 w-4" aria-hidden /> },
]

const TOOL_LABEL: Record<ToolKey, string> = {
  printer: '3D Printer',
  sewing: 'Sewing Machine',
  cnc: 'CNC / Laser Cutter',
  welding: 'Welding Rig',
  hand: 'Hand Tools',
}

// Project requirement database. A module is Ready when every required material
// domain is present AND at least one accepted tool is toggled on.
type FabProject = {
  id: string
  name: string
  domains: DomainKey[]
  material: string
  tools: ToolKey[]
}

const PROJECTS: FabProject[] = [
  {
    id: 'compost-sifter',
    name: 'Egg-Crate Compost Sifter',
    domains: ['bio'],
    material: 'Organic salvage / egg crate',
    tools: ['hand'],
  },
  {
    id: 'thermal-glove',
    name: 'M.A.D. Grips+ Thermal Glove',
    domains: ['glazing'],
    material: 'Silicone bladder',
    tools: ['printer', 'sewing'],
  },
  {
    id: 'tool-apron',
    name: 'W.E.A.R. Load-Bearing Tool Apron',
    domains: ['textile'],
    material: 'Canvas / webbing',
    tools: ['sewing'],
  },
  {
    id: 'rebar-truss',
    name: 'Rebar Tension Truss Node',
    domains: ['steel'],
    material: 'Steel / rebar stock',
    tools: ['welding'],
  },
  {
    id: 'cmu-jig',
    name: 'CMU Stem-Wall Coursing Jig',
    domains: ['masonry'],
    material: 'Cement block / masonry',
    tools: ['hand', 'cnc'],
  },
  {
    id: 'glazing-port',
    name: 'Thermal Envelope Repair Port',
    domains: ['glazing'],
    material: 'Window pane / sealant',
    tools: ['cnc', 'hand'],
  },
  {
    id: 'timber-rib',
    name: 'Cenote Timber Lattice Rib',
    domains: ['timber'],
    material: 'Reclaimed timber / plywood',
    tools: ['cnc', 'hand'],
  },
  {
    id: 'earth-tamper',
    name: 'Rammed-Earth Tamper Guide',
    domains: ['earth', 'timber'],
    material: 'Tire casing + timber form',
    tools: ['hand'],
  },
]

type Evaluated = {
  project: FabProject
  ready: boolean
  missingDomains: DomainKey[]
  toolsOk: boolean
  domainLabel: string
}

export function FabricationMatrix({
  materials,
  disabled,
}: {
  materials: string
  disabled: boolean
}) {
  const [tools, setTools] = usePersistentState<Record<ToolKey, boolean>>('mad.fabtools', {
    printer: false,
    sewing: false,
    cnc: false,
    welding: false,
    hand: false,
  })

  const present = useMemo(() => detectDomains(materials), [materials])

  const evaluated = useMemo<Evaluated[]>(() => {
    return PROJECTS.map((project) => {
      const missingDomains = project.domains.filter((d) => !present.has(d))
      const toolsOk = project.tools.some((t) => tools[t])
      return {
        project,
        ready: missingDomains.length === 0 && toolsOk,
        missingDomains,
        toolsOk,
        domainLabel: project.material,
      }
    })
  }, [present, tools])

  const ready = evaluated.filter((e) => e.ready)
  const locked = evaluated.filter((e) => !e.ready)

  function toggle(key: ToolKey) {
    setTools((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeTools = EQUIPMENT.filter((e) => tools[e.key]).length

  return (
    <Panel title="Fabrication Readiness & Tool Matrix" code={`${ready.length}/${PROJECTS.length} READY`}>
      {/* Equipment toggle bank */}
      <div className="mb-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Equipment Bank · {activeTools} online
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EQUIPMENT.map((eq) => {
            const on = tools[eq.key]
            return (
              <button
                key={eq.key}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => toggle(eq.key)}
                disabled={disabled}
                className={cn(
                  'group flex items-center gap-3 border px-3 py-2 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  on
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50',
                )}
              >
                <span
                  className={cn(
                    'relative h-4 w-7 shrink-0 border transition-colors',
                    on ? 'border-primary bg-primary/30' : 'border-muted-foreground/50 bg-muted',
                  )}
                  aria-hidden
                >
                  <span
                    className={cn(
                      'absolute top-1/2 h-3 w-3 -translate-y-1/2 transition-all',
                      on ? 'left-[calc(100%-14px)] bg-primary' : 'left-0.5 bg-muted-foreground/60',
                    )}
                  />
                </span>
                <span className={cn('shrink-0', on ? 'text-primary' : 'text-muted-foreground')}>
                  {eq.icon}
                </span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                  {eq.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Split output */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ready */}
        <section className="border border-success/40 bg-success/5">
          <header className="flex items-center gap-2 border-b border-success/30 bg-success/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-success">
              Ready to Fabricate Now
            </h3>
            <span className="ml-auto font-mono text-[10px] text-success/80">{ready.length}</span>
          </header>
          <div className="p-2">
            {ready.length === 0 ? (
              <p className="px-1 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                No modules unlocked
              </p>
            ) : (
              <ul className="space-y-2">
                {ready.map((e) => {
                  const usableTools = e.project.tools
                    .filter((t) => tools[t])
                    .map((t) => TOOL_LABEL[t])
                    .join(' + ')
                  return (
                    <li key={e.project.id} className="border border-success/30 bg-background/40 p-2.5">
                      <p className="font-mono text-[11px] font-semibold text-foreground">
                        {e.project.name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-success">
                        Ready: {usableTools} + {e.domainLabel} present
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Locked */}
        <section className="border border-destructive/40 bg-destructive/5">
          <header className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2">
            <Lock className="h-4 w-4 text-destructive" aria-hidden />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-destructive">
              Locked / Missing Requirements
            </h3>
            <span className="ml-auto font-mono text-[10px] text-destructive/80">{locked.length}</span>
          </header>
          <div className="p-2">
            {locked.length === 0 ? (
              <p className="px-1 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                All modules unlocked
              </p>
            ) : (
              <ul className="space-y-2">
                {locked.map((e) => {
                  const missingTools = e.toolsOk
                    ? null
                    : e.project.tools.map((t) => TOOL_LABEL[t]).join(' or ')
                  return (
                    <li key={e.project.id} className="border border-destructive/30 bg-background/40 p-2.5">
                      <p className="font-mono text-[11px] font-semibold text-foreground">
                        {e.project.name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-destructive">
                        Locked:{' '}
                        {missingTools ? `Missing ${missingTools}. ` : 'Tooling OK. '}
                        <span className={e.missingDomains.length ? 'text-destructive' : 'text-success'}>
                          Required material: {e.domainLabel} (
                          {e.missingDomains.length ? 'Missing' : 'Present'})
                        </span>
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Cross-referenced against live Material Optimizer inventory. Toggle equipment to unlock modules; add salvage in the optimizer to satisfy material requirements.
      </p>
    </Panel>
  )
}
