import { Expose, Type } from 'class-transformer'

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
  pncNumber: string

  @Expose()
  croNumber: string

  @Type(() => Date)
  @Expose()
  dateOfBirth: Date

  @Expose()
  mostSeriousOffence: string

  @Expose()
  category: string

  @Expose()
  nationality: string

  @Type(() => Date)
  @Expose()
  sentenceExpiryDate: Date

  @Type(() => Date)
  @Expose()
  licenceExpiryDate: Date

  @Type(() => Date)
  @Expose()
  paroleEligibilityDate: Date

  @Type(() => Date)
  @Expose()
  homeDetentionCurfewEligibilityDate: Date

  @Type(() => Date)
  @Expose()
  releaseDate: Date
}
