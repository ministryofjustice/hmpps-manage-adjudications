export type PrisonLocation = {
  locationId: number
  locationType?: string
  description?: string
  locationUsage?: string
  agencyId?: string
  parentLocationId?: number
  currentOccupancy?: number
  locationPrefix: string
  operationalCapacity?: number
  userDescription: string
  internalLocationCode?: string
}

export type AgencyId = string

export type LocationId = number

export type Agency = {
  agencyId: string
  description: string
}

export type Location = {
  locationId: number
  locationType: string
  description: string
  parentLocationId: number
  currentOccupancy: number
  locationPrefix: string
  userDescription: string
}
