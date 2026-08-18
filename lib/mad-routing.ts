import type { BlueprintRow } from './mad-types'

export type DomainKey =
  | 'module'
  | 'earth'
  | 'bio'
  | 'textile'
  | 'glazing'
  | 'masonry'
  | 'steel'
  | 'timber'
  | 'triage'

export type Route = {
  key: DomainKey
  domain: string
  keywords: string[]
  directive: string
}

// Multi-domain functional routing engine. Ordered by specificity — the first
// category whose keyword is found in the material wins. Bio-media precedes
// timber so "cardboard" is never mis-matched by the timber keyword "board".
export const ROUTES: Route[] = [
  {
    key: 'module',
    domain: 'Structural Module → Shell',
    keywords: ['shipping container', 'container', 'conex', 'isbu', 'culvert', 'tank'],
    directive:
      'Now: inspect corner castings for corrosion & document floor treatment for off-gassing. Later: set on the rubble-trench footing as a braced shell module — cut openings only after temporary bracing is in place.',
  },
  {
    key: 'earth',
    domain: 'Rammed Earth → Mass Walls',
    keywords: ['tire', 'tyre'],
    directive:
      'Now: clean, sort by diameter & pre-stage fill soil. Later: ram earth in staggered courses for retaining footing or thermal-mass wall (~300+ lb/tire once packed); pin courses & parge exposed faces.',
  },
  {
    key: 'bio',
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
    key: 'textile',
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
    key: 'glazing',
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
    key: 'masonry',
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
    key: 'steel',
    domain: 'Structural Steel → Ties / Anchors',
    keywords: [
      'steel', 'rebar', 'metal', 'iron', 'angle iron', 'pipe', 'tube', 'wire',
      'sheet metal', 'aluminum', 'fastener', 'bolt', 'bracket',
    ],
    directive:
      'Now: wire-brush surface rust, straighten & bundle by gauge/length. Later: fabricate tension ties, anchor straps & lattice connectors — verify capacity with an engineer before load (est. ~40 ksi yield on unknown mild steel).',
  },
  {
    key: 'timber',
    domain: 'Structural Timber → Framing / Formwork',
    keywords: [
      'pallet', 'wood', 'lumber', 'board', 'plank', 'timber', 'beam', 'joist',
      'plywood', 'osb', 'stud', 'batten', 'dunnage',
    ],
    directive:
      'Now: de-nail, sort by grade & moisture-check; quarantine rot or insect damage. Later: mill for cenote shell ribs, radial lattice & reusable formwork; treat all ground-contact ends.',
  },
]

export const FALLBACK_DIRECTIVE =
  'Now: photograph, measure & tag with a salvage ID; store dry under cover and flag hazards (sharp / toxic / rot). Later: re-run through the router after cleaning, or divert to the barter / scrap stream if no build role emerges by Framing.'

export function classify(material: string): { key: DomainKey; domain: string; directive: string } {
  const m = material.toLowerCase()
  for (const route of ROUTES) {
    if (route.keywords.some((k) => m.includes(k))) {
      return { key: route.key, domain: route.domain, directive: route.directive }
    }
  }
  return { key: 'triage', domain: 'Unclassified → Triage Queue', directive: FALLBACK_DIRECTIVE }
}

export function parseMaterials(materials: string): string[] {
  return materials
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function generateBlueprint(materials: string): BlueprintRow[] {
  const tokens = parseMaterials(materials)
  if (tokens.length === 0) return []
  return tokens.slice(0, 12).map((mat) => {
    const { domain, directive } = classify(mat)
    return { phase: domain, input: mat, directive }
  })
}

// Returns the set of functional domains present in the material inventory,
// each mapped to the specific salvage token that satisfied it.
export function detectDomains(materials: string): Map<DomainKey, string> {
  const present = new Map<DomainKey, string>()
  for (const token of parseMaterials(materials)) {
    const { key } = classify(token)
    if (key !== 'triage' && !present.has(key)) present.set(key, token)
  }
  return present
}
