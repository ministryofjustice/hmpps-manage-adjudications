export type PrisonLocation = {
  locationId: number
  locationType: string
  description: string
  locationUsage: string
  agencyId: string
  parentLocationId: number
  currentOccupancy: number
  locationPrefix: string
  operationalCapacity: number
  userDescription: string
  internalLocationCode: string
}

export type AgencyId = string

export type Prison = {
  agencyId: string
  description: string
  agencyType: string
  active: boolean
}
