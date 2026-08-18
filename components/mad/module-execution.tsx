'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, RotateCcw, Wrench } from 'lucide-react'
import { usePersistentState } from '@/lib/use-persistent-state'
import type { BlueprintRow, Milestone } from '@/lib/mad-types'
import { generateBlueprint } from '@/lib/mad-routing'
import { Panel, Field } from './panel'
import { ActionButton } from './action-button'
import { FabricationMatrix } from './fabrication-matrix'
import { cn } from '@/lib/utils'

const DEFAULT_MILESTONES: Milestone[] = [
  { key: 'clearing', label: 'Land Clearing', detail: 'Grub, grade & stockpile organic material', status: 'pending' },
  { key: 'foundation', label: 'Foundation', detail: 'Core ring beam & rubble-trench footing', status: 'pending' },
  { key: 'framing', label: 'Framing', detail: 'Cenote shell ribs & radial lattice', status: 'pending' },
  { key: 'finishes', label: 'Finishes', detail: 'Envelope seal, thermal mass & fit-out', status: 'pending' },
]

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
    <div className="flex flex-col gap-5">
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

      <FabricationMatrix materials={materials} disabled={disabled} />
    </div>
  )
}
