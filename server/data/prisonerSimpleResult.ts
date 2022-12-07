import { Expose } from 'class-transformer'

export default class PrisonerSimpleResult {
  @Expose()
  offenderNo: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  assignedLivingUnitDesc?: string
}
