import { Expose } from 'class-transformer'

type CurrentIncentiveLevel = {
  code: string
  description: string
}
type CurrentIncentive = {
  level: CurrentIncentiveLevel
  dateTime: string
  nextReviewDate: string
}

export default class PrisonerSearchResult {
  @Expose()
  prisonerNumber: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  prisonId: string

  @Expose()
  prisonName: string

  @Expose()
  cellLocation: string

  @Expose()
  gender: string

  @Expose()
  currentIncentive?: CurrentIncentive
}
