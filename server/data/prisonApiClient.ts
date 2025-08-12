import type { Readable } from 'stream'
import { plainToClass } from 'class-transformer'

import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import PrisonerSimpleResult from './prisonerSimpleResult'
import PrisonerResult from './prisonerResult'
import { Agency, AgencyId, Location } from './PrisonLocationResult'
import { SecondaryLanguage } from './SecondaryLanguageResult'

export interface CaseLoad {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

export interface OffenderMovementInfo {
  offenderNo: string
  createDateTime: string
  fromAgency: string
  fromAgencyDescription: string
  toAgency: string
  toAgencyDescription: string
  fromCity: string
  toCity: string
  movementType: string
  movementTypeDescription: string
  directionCode: string
  movementDate: string
  movementTime: string
  movementReason: string
  commentText?: string
}

export interface OffenderBannerInfo {
  movementDate: string
  toAgencyDescription: string
  prisonerName: string
}

export interface DamageObligation {
  id: number
  offenderNo: string
  referenceNumber: string
  startDateTime: string
  endDateTime: string
  prisonId: string
  amountToPay: number
  amountPaid: number
  status: string
  comment: string
  currency: string
}

export interface Balances {
  spends: number
  cash: number
  savings: number
  currency: string
  damageObligations: number
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
    return result.map(_ => plainToClass(PrisonerResult, _, { excludeExtraneousValues: false }))
  }

  async getUsersLocations(): Promise<Location[]> {
    return this.restClient.get({
      path: `/api/users/me/locations`,
    })
  }

  async getAgency(agencyId: AgencyId): Promise<Agency> {
    return this.restClient.get({
      path: `/api/agencies/${agencyId}?activeOnly=false`,
    })
  }

  async getSecondaryLanguages(bookingId: number): Promise<SecondaryLanguage[]> {
    return this.restClient.get({
      path: `/api/bookings/${bookingId}/secondary-languages`,
    })
  }

  async getMovementByOffender(offenderNo: string): Promise<OffenderMovementInfo[]> {
    return this.restClient.post({
      path: `/api/movements/offenders?movementType=ADM&latestOnly=false&allBookings=false`,
      data: [offenderNo],
    })
  }

  async getDamageObligation(offenderNo: string): Promise<DamageObligation[]> {
    return this.restClient.get({
      path: `/api/offenders/${offenderNo}/damage-obligations?status=ACTIVE`,
    })
  }

  async getBalances(bookingId: number): Promise<Balances> {
    return this.restClient.get({
      path: `/api/bookings/${bookingId}/balances`,
    })
  }
}
