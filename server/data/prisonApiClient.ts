import type { Readable } from 'stream'
import { plainToClass } from 'class-transformer'

import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import PrisonerSimpleResult from './prisonerSimpleResult'
import PrisonerResult from './prisonerResult'
import { Agency, AgencyId, Location, LocationId } from './PrisonLocationResult'
import { SecondaryLanguage } from './SecondaryLanguageResult'

export interface CaseLoad {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

export default class PrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prison, token)
  }

  getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.restClient.get<CaseLoad[]>({ path: '/api/users/me/caseLoads' })
  }

  getPrisonerImage(prisonerNumber: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${prisonerNumber}/image/data`,
      errorLogger: error =>
        error.status === 404
          ? logger.info(`No prisoner image available for prisonerNumber: ${prisonerNumber}`)
          : this.restClient.defaultErrorLogger(error),
    }) as Promise<Readable>
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<PrisonerResult> {
    const result = await this.restClient.get<PrisonerResult>({
      path: `/api/offenders/${prisonerNumber}`,
    })

    return plainToClass(PrisonerResult, result, { excludeExtraneousValues: true })
  }

  async getBatchPrisonerDetails(prisonerNumbers: string[]): Promise<PrisonerSimpleResult[]> {
    const result = await this.restClient.post<PrisonerSimpleResult[]>({
      path: `/api/bookings/offenders?activeOnly=false`,
      data: prisonerNumbers,
    })
    return result.map(_ => plainToClass(PrisonerResult, _, { excludeExtraneousValues: true }))
  }

  async getLocations(agencyId: string, occurrenceLocationsOnly = true): Promise<Location[]> {
    return this.restClient.get({
      path: `/api/agencies/${agencyId}/locations${occurrenceLocationsOnly ? '?eventType=OCCUR' : ''}`,
      headers: { 'Sort-Fields': 'userDescription' },
    })
  }

  async getLocation(locationId: LocationId): Promise<Location> {
    return this.restClient.get({
      path: `/api/locations/${locationId}`,
    })
  }

  async getAgency(agencyId: AgencyId): Promise<Agency> {
    return this.restClient.get({
      path: `/api/agencies/${agencyId}`,
    })
  }

  async getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]> {
    return this.restClient.get({
      path: `/api/bookings/${bookingId}/secondary-languages`,
    })
  }
}
