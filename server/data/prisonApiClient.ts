import type { Readable } from 'stream'
import { plainToClass } from 'class-transformer'

import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import PrisonerResult from './prisonerResult'
import { PrisonLocation } from './PrisonLocationResult'

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

  async getLocations(agencyId: string, occurrenceLocationsOnly = true): Promise<PrisonLocation[]> {
    return this.restClient.get({
      path: `/api/agencies/${agencyId}/locations${occurrenceLocationsOnly ? '?eventType=OCCUR' : ''}`,
      headers: { 'Sort-Fields': 'userDescription' },
    })
  }
}
