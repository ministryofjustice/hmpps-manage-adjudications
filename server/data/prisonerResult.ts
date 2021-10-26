import { Expose } from 'class-transformer'

type AssignedLivingUnit = {
  agencyId: string
  locationId: number
  description: string
  agencyName: string
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
  categoryCode: string
}
