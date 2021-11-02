interface Agency {
  agencyId: string
  description: string
  agencyType: string
  active: boolean
}

interface Location {
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

export type PrisonLocation = Location
export type AgencyId = string
export type Prison = Agency
