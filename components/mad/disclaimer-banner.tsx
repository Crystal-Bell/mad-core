'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const NOT_ITEMS = [
  {
    title: 'Not a Construction Contractor',
    body: 'The system performs no physical construction, building, installation, or labor. All physical building and site execution are performed entirely by the user, at their own discretion and risk.',
  },
  {
    title: 'Not a Utility Locator or Surveying Tool',
    body: 'Simulated utility lines, ground data, and water-table metrics are digital visual aids only. They do not replace professional land surveys or official municipal utility marking (such as calling 811 before digging).',
  },
  {
    title: 'Not a Physical Land Modifier',
    body: 'The platform is purely software and does not interact with, alter, or impact physical earth, property, or the environment.',
  },
  {
    title: 'Not a Manufacturing Device',
    body: 'Outputs are digital data, text instructions, and design files only. Nothing is physically materialized, manufactured, or shipped.',
  },
  {
    title: 'Liability & Safety Waiver',
    body: 'No liability is assumed for structural stability, code compliance, zoning approval, or physical safety. Users retain 100% personal responsibility for local laws, engineering standards, and safe building practices.',
  },
]

export function DisclaimerBanner() {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b-2 border-warning/70 bg-warning/10">
      <div className="mx-auto max-w-7xl px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 text-left"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          <p className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed text-warning">
            <span className="font-semibold uppercase tracking-wider">System Disclaimer:</span>{' '}
            Conceptual planning &amp; organizational software only. Not a contractor, surveyor, or
            manufacturer. Users retain 100% responsibility for real-world execution &amp; safety.
          </p>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-warning transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>

        {open && (
          <div className="mt-3 grid gap-3 border-t border-warning/30 pt-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-warning/90">
                Operational Scope — What the System IS
              </h3>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-foreground/80">
                A conceptual planning engine that generates digital blueprints, phased frameworks,
                and fabrication guides for personal maker projects and salvage strategies — plus an
                organizational dashboard to track phases, materials, and workflows.
              </p>
            </div>
            {NOT_ITEMS.map((item) => (
              <div key={item.title} className="border border-warning/25 bg-background/40 p-2.5">
                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-warning/90">
                  {item.title}
                </h4>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
