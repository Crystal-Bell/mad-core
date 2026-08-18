export type SiteState = {
  name: string
  createdAt: string
} | null

export type Coordinates = {
  lat: string
  lng: string
  elevation: string
  waterTable: string
}

export type ZoningItem = {
  id: string
  label: string
  done: boolean
}

export type MilestoneKey = 'clearing' | 'foundation' | 'framing' | 'finishes'

export type Milestone = {
  key: MilestoneKey
  label: string
  detail: string
  status: 'pending' | 'complete'
}

export type BlueprintRow = {
  phase: string
  input: string
  directive: string
}

export type GearSpec = {
  title: string
  loadDistribution: string[]
  thermalDisplacement: string[]
  assembly: string[]
}
