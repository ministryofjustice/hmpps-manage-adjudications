export type PrisonLocation = {
  locationId: number
  locationPrefix: string
  userDescription: string
}

export type AgencyId = string

export type LocationId = number

export type Agency = {
  agencyId: string
  description: string
}

export type Location = {
  locationId: number
  locationPrefix: string
  userDescription: string
  agencyId: string
}
