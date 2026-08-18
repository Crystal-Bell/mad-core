'use client'

import { useState } from 'react'
import { Cog, Download, Thermometer, Weight } from 'lucide-react'
import { usePersistentState } from '@/lib/use-persistent-state'
import type { GearSpec } from '@/lib/mad-types'
import { Panel, Field } from './panel'
import { ActionButton } from './action-button'
import { cn } from '@/lib/utils'

const PHASES = ['Land Clearing', 'Foundation', 'Framing', 'Finishes'] as const
const CLIMATES = ['Arid / High Desert', 'Temperate', 'Cold / Alpine', 'Humid / Coastal'] as const

function fabricate(phase: string, climate: string): GearSpec {
  const load: Record<string, string[]> = {
    'Land Clearing': [
      'Hip-belt harness rated 24 kg sustained; transfer 70% mass to iliac crest.',
      'Wide-stance debris sled — 4-point sling, center of gravity below knee height.',
    ],
    Foundation: [
      'Dual-shoulder yoke for form panels; balance ±3 kg across load points.',
      'Knee-saver kneeling rig with 18 mm closed-cell deck.',
    ],
    Framing: [
      'Tool-tether spine vest; distribute 9–14 kg vertically along thoracic line.',
      'Overhead-reach counterweight lanyard to offset arm fatigue.',
    ],
    Finishes: [
      'Precision fine-tool apron; micro-pocket load ≤ 4 kg forward-balanced.',
      'Anti-vibration wrist cuffs for sustained fastening work.',
    ],
  }

  const thermal: Record<string, string[]> = {
    'Arid / High Desert': [
      'Reflective outer shell (albedo ≥ 0.7) + evaporative underlayer channel.',
      'Radiant displacement vents at underarm & lumbar; purge cycle every 20 min.',
    ],
    Temperate: [
      'Modular 3-layer stack; strip mid-layer above 18°C exertion threshold.',
      'Passive convective back-panel channel for waste-heat displacement.',
    ],
    'Cold / Alpine': [
      'Sealed core-loft with metered face-vent to bleed condensation.',
      'Extremity thermal reservoirs; displace core heat outward on descent.',
    ],
    'Humid / Coastal': [
      'Wicking capillary weave; forced lateral airflow to shed latent heat.',
      'Anti-fungal contact liner; displacement drains routed away from core.',
    ],
  }

  return {
    title: `${phase} · ${climate} Assembly`,
    loadDistribution: load[phase] ?? [],
    thermalDisplacement: thermal[climate] ?? [],
    assembly: [
      `Stage 1 — Fit base harness to torso; verify load path terminates at hips, not spine.`,
      `Stage 2 — Attach ${phase.toLowerCase()} tool modules per balance table above.`,
      `Stage 3 — Route ${climate.split(' ')[0].toLowerCase()} thermal channels; confirm unobstructed airflow.`,
      `Stage 4 — Load-test at 1.25× working weight before field use. User assumes all safety risk.`,
    ],
  }
}

export function ModuleGear({ disabled }: { disabled: boolean }) {
  const [phase, setPhase] = usePersistentState<string>('mad.gear.phase', PHASES[0])
  const [climate, setClimate] = usePersistentState<string>('mad.gear.climate', CLIMATES[0])
  const [spec, setSpec] = usePersistentState<GearSpec | null>('mad.gear.spec', null)
  const [exported, setExported] = useState(false)

  function onFabricate() {
    setSpec(fabricate(phase, climate))
    setExported(false)
  }

  function exportSheet() {
    if (!spec) return
    const lines = [
      'M.A.D. UTILITY & GEAR — SPEC SHEET',
      '(Conceptual planning output. Not a manufactured product. User assumes all risk.)',
      '',
      spec.title,
      '',
      'LOAD DISTRIBUTION:',
      ...spec.loadDistribution.map((l) => `  - ${l}`),
      '',
      'THERMAL DISPLACEMENT:',
      ...spec.thermalDisplacement.map((l) => `  - ${l}`),
      '',
      'ASSEMBLY INSTRUCTIONS:',
      ...spec.assembly.map((l) => `  ${l}`),
      '',
      `Generated ${new Date().toLocaleString()}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mad-spec-${phase.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Gear Generator" code="MOD-03">
        <div className="space-y-4">
          <Field label="Build Phase">
            <div className="grid grid-cols-2 gap-2">
              {PHASES.map((p) => (
                <SelectChip key={p} active={phase === p} onClick={() => setPhase(p)} disabled={disabled}>
                  {p}
                </SelectChip>
              ))}
            </div>
          </Field>
          <Field label="Climate Condition">
            <div className="grid grid-cols-2 gap-2">
              {CLIMATES.map((c) => (
                <SelectChip key={c} active={climate === c} onClick={() => setClimate(c)} disabled={disabled}>
                  {c}
                </SelectChip>
              ))}
            </div>
          </Field>
          <ActionButton
            onClick={onFabricate}
            disabled={disabled}
            icon={<Cog className="h-3.5 w-3.5" />}
            className="w-full"
          >
            Fabricate Specs
          </ActionButton>
        </div>
      </Panel>

      <Panel
        title="Spec Sheet"
        code="OUTPUT"
        action={
          <ActionButton
            variant="outline"
            onClick={exportSheet}
            disabled={disabled || !spec}
            icon={<Download className="h-3.5 w-3.5" />}
          >
            {exported ? 'Exported' : 'Export Spec Sheet'}
          </ActionButton>
        }
      >
        {!spec ? (
          <div className="mad-grid flex h-40 items-center justify-center border border-dashed border-border bg-background/30">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Select parameters &amp; fabricate
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="border-b border-border pb-2 font-mono text-sm font-semibold text-primary">
              {spec.title}
            </h3>
            <SpecBlock icon={<Weight className="h-3.5 w-3.5" />} label="Load Distribution" items={spec.loadDistribution} />
            <SpecBlock icon={<Thermometer className="h-3.5 w-3.5" />} label="Thermal Displacement" items={spec.thermalDisplacement} />
            <SpecBlock label="Assembly Instructions" items={spec.assembly} ordered />
          </div>
        )}
      </Panel>
    </div>
  )
}

function SelectChip({
  active,
  children,
  onClick,
  disabled,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'border px-3 py-2 text-left font-mono text-[11px] transition-colors disabled:opacity-40',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border bg-background/50 text-foreground hover:border-primary/60',
      )}
    >
      {children}
    </button>
  )
}

function SpecBlock({
  icon,
  label,
  items,
  ordered,
}: {
  icon?: React.ReactNode
  label: string
  items: string[]
  ordered?: boolean
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 border-l-2 border-primary/40 bg-background/40 py-1.5 pl-2.5 pr-2">
            {ordered && <span className="font-mono text-[10px] text-primary">{i + 1}.</span>}
            <span className="font-mono text-[11px] leading-relaxed text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
