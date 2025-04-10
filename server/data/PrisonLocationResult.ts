export type PrisonLocation = {
  locationId: number // TODO: MAP-2114: remove at a later date
  locationUuid: string
  locationPrefix: string
  userDescription: string
}

export type AgencyId = string

export type LocationId = number // TODO: MAP-2114: remove at a later date

export type LocationUuid = string

export type Agency = {
  agencyId: string
  description: string
}

export type Location = {
  locationId: number // TODO: MAP-2114: remove at a later date
  locationUuid: string
  locationPrefix: string
  userDescription: string
  agencyId: string
}

export type IncidentLocation = {
  locationId: string // TODO: MAP-2114: remove at a later date
  locationUuid: string
  locationPrefix: string
  userDescription: string
  agencyId?: string
}

export type LocationsApiLocation = {
  id: string
  prisonId?: string
  localName: string
  pathHierarchy?: string
  key: string
}

export type NomisSyncMapLocation = {
  nomisLocationId?: number
  dpsLocationId?: string
}
