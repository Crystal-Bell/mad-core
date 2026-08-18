'use client'

import { useState } from 'react'
import { Compass, HardHat, MapPinned, Radiation, RotateCcw } from 'lucide-react'
import { usePersistentState } from '@/lib/use-persistent-state'
import type { SiteState } from '@/lib/mad-types'
import { DisclaimerBanner } from './disclaimer-banner'
import { Panel, TextInput } from './panel'
import { ActionButton } from './action-button'
import { ModuleProperty } from './module-property'
import { ModuleExecution } from './module-execution'
import { ModuleGear } from './module-gear'
import { cn } from '@/lib/utils'

type TabId = 'property' | 'execution' | 'gear'

const TABS: { id: TabId; label: string; short: string; icon: typeof MapPinned }[] = [
  { id: 'property', label: 'Property Intelligence', short: 'MOD-01', icon: MapPinned },
  { id: 'execution', label: 'Phased Dwelling Execution', short: 'MOD-02', icon: HardHat },
  { id: 'gear', label: 'M.A.D. Utility & Gear', short: 'MOD-03', icon: Compass },
]

export function MadApp() {
  const [tab, setTab] = usePersistentState<TabId>('mad.tab', 'property')
  const [site, setSite] = usePersistentState<SiteState>('mad.site', null)
  const [nameInput, setNameInput] = useState('')

  const active = site !== null

  function createSite() {
    const name = nameInput.trim() || 'Untitled Field Build'
    setSite({ name, createdAt: new Date().toISOString() })
    setNameInput('')
  }

  function unloadSite() {
    setSite(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <DisclaimerBanner />

      {/* Header */}
      <header className="border-b border-border bg-card/60 mad-scanlines">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-primary bg-primary/15">
              <Radiation className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                M.A.D. Core
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Site Intelligence Engine · v1.0
              </p>
            </div>
          </div>

          {/* Site state control */}
          <div className="flex items-center gap-2">
            {active ? (
              <div className="flex items-center gap-2">
                <div className="border border-success/50 bg-success/10 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-success">
                    Active Site
                  </p>
                  <p className="font-mono text-xs font-semibold text-foreground">{site!.name}</p>
                </div>
                <ActionButton
                  variant="danger"
                  onClick={unloadSite}
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                >
                  Unload
                </ActionButton>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <div>
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Site Name
                  </span>
                  <TextInput
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                        createSite()
                      }
                    }}
                    placeholder="Montague, CA Field Build"
                    className="w-56"
                  />
                </div>
                <ActionButton onClick={createSite} icon={<MapPinned className="h-3.5 w-3.5" />}>
                  Create / Load Site
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-border bg-background" aria-label="Modules">
        <div className="mx-auto flex max-w-7xl gap-0 overflow-x-auto px-4">
          {TABS.map((t) => {
            const Icon = t.icon
            const selected = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-2.5 whitespace-nowrap border-b-2 px-4 py-3.5 transition-colors',
                  selected
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="flex flex-col items-start">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                    {t.label}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest opacity-70">
                    {t.short}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Body */}
      <div className="mad-grid">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {!active && (
            <div className="mb-5 border border-warning/50 bg-warning/10 px-4 py-3">
              <p className="font-mono text-xs text-warning">
                No active site. Create or load a site above to initialize project state — modules
                are read-only until a site is active.
              </p>
            </div>
          )}

          {tab === 'property' && <ModuleProperty disabled={!active} />}
          {tab === 'execution' && <ModuleExecution disabled={!active} />}
          {tab === 'gear' && <ModuleGear disabled={!active} />}
        </div>
      </div>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
            M.A.D. Core is conceptual planning &amp; organizational software. It is not a contractor,
            surveyor, utility locator, or manufacturer. All simulated data are visual aids only. Users
            retain 100% responsibility for local laws, engineering standards, permits, and safe
            building practices. Always call 811 before digging.
          </p>
        </div>
      </footer>
    </main>
  )
}
