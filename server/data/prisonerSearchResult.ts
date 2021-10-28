import { Expose } from 'class-transformer'

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
}
