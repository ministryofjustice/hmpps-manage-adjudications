import { Expose } from 'class-transformer'

type AssignedLivingUnit = {
  agencyId: string
  locationId: number
  description: string
  agencyName: string
}

type PhysicalAttributes = {
  gender: string
}

export default class PrisonerResult {
  @Expose()
  offenderNo: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  assignedLivingUnit: AssignedLivingUnit

  @Expose()
  assignedLivingUnitDesc?: string

  @Expose()
  categoryCode: string

  @Expose()
  language: string

  @Expose()
  dateOfBirth: string

  @Expose()
  physicalAttributes: PhysicalAttributes
}
