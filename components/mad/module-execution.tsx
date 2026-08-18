'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, RotateCcw, Wrench } from 'lucide-react'
import { usePersistentState } from '@/lib/use-persistent-state'
import type { BlueprintRow, Milestone } from '@/lib/mad-types'
import { Panel, Field, TextInput } from './panel'
import { ActionButton } from './action-button'
import { cn } from '@/lib/utils'

const DEFAULT_MILESTONES: Milestone[] = [
  { key: 'clearing', label: 'Land Clearing', detail: 'Grub, grade & stockpile organic material', status: 'pending' },
  { key: 'foundation', label: 'Foundation', detail: 'Core ring beam & rubble-trench footing', status: 'pending' },
  { key: 'framing', label: 'Framing', detail: 'Cenote shell ribs & radial lattice', status: 'pending' },
  { key: 'finishes', label: 'Finishes', detail: 'Envelope seal, thermal mass & fit-out', status: 'pending' },
]

type Route = {
  domain: string
  keywords: string[]
  directive: string
}

// Multi-domain functional routing engine. Ordered by specificity — the first
// category whose keyword is found in the material wins. Bio-media precedes
// timber so "cardboard" is never mis-matched by the timber keyword "board".
const ROUTES: Route[] = [
  {
    domain: 'Structural Module → Shell',
    keywords: ['shipping container', 'container', 'conex', 'isbu', 'culvert', 'tank'],
    directive:
      'Now: inspect corner castings for corrosion & document floor treatment for off-gassing. Later: set on the rubble-trench footing as a braced shell module — cut openings only after temporary bracing is in place.',
  },
  {
    domain: 'Rammed Earth → Mass Walls',
    keywords: ['tire', 'tyre'],
    directive:
      'Now: clean, sort by diameter & pre-stage fill soil. Later: ram earth in staggered courses for retaining footing or thermal-mass wall (~300+ lb/tire once packed); pin courses & parge exposed faces.',
  },
  {
    domain: 'Bio-Media → Compost / Seed-Starting',
    keywords: [
      'egg crate', 'egg carton', 'cardboard', 'organic', 'compost', 'soil', 'manure',
      'leaves', 'leaf', 'straw', 'coffee ground', 'sawdust', 'newspaper', 'wood chip',
      'mulch', 'food scrap', 'kitchen waste', 'peat', 'hay', 'grass clipping',
    ],
    directive:
      'Now: shred & wet as carbon "browns"; layer 3:1 with green organics in the hot-compost bay. Later: use egg-crate cells for seed-starting plugs and finished humus to top-dress the garden berm during Finishes.',
  },
  {
    domain: 'Textile → M.A.D. W.E.A.R. Modules',
    keywords: [
      'fabric', 'thread', 'sewing', 'machine part', 'webbing', 'canvas', 'denim',
      'cloth', 'textile', 'nylon', 'cotton', 'zipper', 'strap', 'buckle',
      'upholstery', 'tarp', 'mesh', 'velcro', 'grommet',
    ],
    directive:
      'Now: launder, de-thread & spool reusable notions; QC machine parts against the W.E.A.R. jig. Later: cut to pattern for load-bearing tool aprons, gear-harness webbing & insulated envelope liners.',
  },
  {
    domain: 'Glazing & Repair → Thermal Envelope',
    keywords: [
      'glass', 'bottle', 'window', 'pane', 'sealant', 'glazing', 'mirror', 'acrylic',
      'plexi', 'polycarbonate', 'caulk', 'silicone', 'epoxy', 'resin', 'adhesive',
      'gasket', 'door',
    ],
    directive:
      'Now: measure & label panes by clear dimension; decant sealants and check cure dates. Later: install as daylight glazing in the thermal envelope; stage adhesives at repair ports for gasket & crack remediation.',
  },
  {
    domain: 'Structural Masonry → Foundation / Walls',
    keywords: [
      'cement block', 'cinder block', 'cinderblock', 'cinder', 'concrete block',
      'breeze block', 'concrete', 'cmu', 'brick', 'block', 'stone', 'masonry',
      'mortar', 'paver', 'cobble', 'boulder', 'rubble',
    ],
    directive:
      'Now: dry-stack a test course to prove the load path & sort intact vs. spalled units. Later: bed in lime mortar for the stem wall / ring-beam footing (~2,800 psi bearing on sound CMU); divert half-blocks to thermal-mass infill.',
  },
  {
    domain: 'Structural Steel → Ties / Anchors',
    keywords: [
      'steel', 'rebar', 'metal', 'iron', 'angle iron', 'pipe', 'tube', 'wire',
      'sheet metal', 'aluminum', 'fastener', 'bolt', 'bracket',
    ],
    directive:
      'Now: wire-brush surface rust, straighten & bundle by gauge/length. Later: fabricate tension ties, anchor straps & lattice connectors — verify capacity with an engineer before load (est. ~40 ksi yield on unknown mild steel).',
  },
  {
    domain: 'Structural Timber → Framing / Formwork',
    keywords: [
      'pallet', 'wood', 'lumber', 'board', 'plank', 'timber', 'beam', 'joist',
      'plywood', 'osb', 'stud', 'batten', 'dunnage',
    ],
    directive:
      'Now: de-nail, sort by grade & moisture-check; quarantine rot or insect damage. Later: mill for cenote shell ribs, radial lattice & reusable formwork; treat all ground-contact ends.',
  },
]

const FALLBACK_DIRECTIVE =
  'Now: photograph, measure & tag with a salvage ID; store dry under cover and flag hazards (sharp / toxic / rot). Later: re-run through the router after cleaning, or divert to the barter / scrap stream if no build role emerges by Framing.'

function classify(material: string): { domain: string; directive: string } {
  const m = material.toLowerCase()
  for (const route of ROUTES) {
    if (route.keywords.some((k) => m.includes(k))) {
      return { domain: route.domain, directive: route.directive }
    }
  }
  return { domain: 'Unclassified → Triage Queue', directive: FALLBACK_DIRECTIVE }
}

function generateBlueprint(materials: string): BlueprintRow[] {
  const tokens = materials
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean)

  if (tokens.length === 0) return []

  return tokens.slice(0, 12).map((mat) => {
    const { domain, directive } = classify(mat)
    return { phase: domain, input: mat, directive }
  })
}

export function ModuleExecution({ disabled }: { disabled: boolean }) {
  const [milestones, setMilestones] = usePersistentState<Milestone[]>('mad.milestones', DEFAULT_MILESTONES)
  const [materials, setMaterials] = usePersistentState('mad.materials', '')
  const [blueprint, setBlueprint] = usePersistentState<BlueprintRow[]>('mad.blueprint', [])
  const [flash, setFlash] = useState<string | null>(null)

  const progress = useMemo(
    () => Math.round((milestones.filter((m) => m.status === 'complete').length / milestones.length) * 100),
    [milestones],
  )

  function setStatus(key: string, status: 'pending' | 'complete') {
    setMilestones((prev) => prev.map((m) => (m.key === key ? { ...m, status } : m)))
  }

  function generate() {
    const rows = generateBlueprint(materials)
    setBlueprint(rows)
    const domains = new Set(rows.map((r) => r.phase)).size
    setFlash(
      rows.length
        ? `Routed ${rows.length} item${rows.length > 1 ? 's' : ''} across ${domains} functional domain${domains > 1 ? 's' : ''}.`
        : 'Enter at least one material.',
    )
    setTimeout(() => setFlash(null), 2500)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Cenote Core — Milestone Tracker" code={`${progress}%`}>
        <div className="mb-4 h-1.5 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="space-y-3">
          {milestones.map((m, i) => {
            const done = m.status === 'complete'
            return (
              <li
                key={m.key}
                className={cn(
                  'border p-3 transition-colors',
                  done ? 'border-success/50 bg-success/5' : 'border-border bg-background/50',
                )}
              >
                <div className="flex items-start gap-3">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-primary">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-mono text-sm font-semibold text-foreground">{m.label}</p>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{m.detail}</p>
                    <div className="mt-2.5 flex gap-2">
                      <ActionButton
                        variant={done ? 'ghost' : 'primary'}
                        onClick={() => setStatus(m.key, 'complete')}
                        disabled={disabled || done}
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      >
                        Mark Complete
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => setStatus(m.key, 'pending')}
                        disabled={disabled || !done}
                        icon={<RotateCcw className="h-3.5 w-3.5" />}
                      >
                        Reset Phase
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="flex flex-col gap-5">
        <Panel title="On-Hand Material Optimizer" code="MOD-02">
          <Field label="Available Salvage / Materials" hint="comma or line separated">
            <textarea
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              rows={5}
              placeholder="cement blocks, cardboard, canvas webbing, window panes, steel rebar…"
              className="w-full resize-none border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </Field>
          <div className="mt-3 flex items-center gap-3">
            <ActionButton
              onClick={generate}
              disabled={disabled}
              icon={<Wrench className="h-3.5 w-3.5" />}
            >
              Generate Custom Blueprint
            </ActionButton>
            {flash && <span className="font-mono text-[11px] text-primary">{flash}</span>}
          </div>
        </Panel>

        <Panel title="Tailored Phase Directives" code="OUTPUT">
          {blueprint.length === 0 ? (
            <div className="mad-grid flex h-28 items-center justify-center border border-dashed border-border bg-background/30">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                No blueprint generated
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-secondary/60">
                    <th className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Route / Domain
                    </th>
                    <th className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Input
                    </th>
                    <th className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Directive
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blueprint.map((row, i) => (
                    <tr key={i} className={i % 2 ? 'bg-background/40' : ''}>
                      <td className="border-b border-border px-3 py-2 align-top font-mono text-[11px] text-primary">
                        {row.phase}
                      </td>
                      <td className="border-b border-border px-3 py-2 align-top font-mono text-[11px] text-foreground">
                        {row.input}
                      </td>
                      <td className="border-b border-border px-3 py-2 align-top font-mono text-[11px] text-muted-foreground">
                        {row.directive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
