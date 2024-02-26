import { Expose } from 'class-transformer'
import { Alert } from '../utils/alertHelper'

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

  @Expose()
  automaticReleaseDate?: string

  @Expose()
  conditionalReleaseDate?: string

  @Expose()
  sentenceStartDate?: string

  @Expose()
  alerts?: Alert[]
}
