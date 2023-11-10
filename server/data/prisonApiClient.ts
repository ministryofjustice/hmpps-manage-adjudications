import type { Readable } from 'stream'
import { plainToClass } from 'class-transformer'

import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import PrisonerSimpleResult from './prisonerSimpleResult'
import PrisonerResult from './prisonerResult'
import { Agency, AgencyId, Location, LocationId } from './PrisonLocationResult'
import { SecondaryLanguage } from './SecondaryLanguageResult'
import { Alert, alertCodeString, PrisonerAlerts } from '../utils/alertHelper'

export interface CaseLoad {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

export interface Inmate {
  bookingId: number
  bookingNo: string
  offenderNo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  age: number
  agencyId: string
  assignedLivingUnitId: number
  alertsCodes: string[]
  alertsDetails: string[]
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

export enum SanctionStatus {
  IMMEDIATE = 'IMMEDIATE',
  PROSPECTIVE = 'PROSPECTIVE',
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

  async getAlertsForPrisoner(prisonerNumber: string): Promise<PrisonerAlerts> {
    const alerts = await this.restClient
      .get<Alert[]>({
        path: `/api/offenders/${prisonerNumber}/alerts/v2?alertCodes=${alertCodeString}`,
      })
      .catch(error => {
        if (error.status === 404) {
          logger.info(`No alerts available for prisonerNumber: ${prisonerNumber}`)
        }
      })

    return {
      prisonerNumber,
      alerts: alerts || [],
    }
  }

  async getLocations(agencyId: string, occurrenceLocationsOnly = true): Promise<Location[]> {
    return this.restClient.get({
      path: `/api/agencies/${agencyId}/locations${occurrenceLocationsOnly ? '?eventType=OCCUR' : ''}`,
      headers: { 'Sort-Fields': 'userDescription' },
    })
  }

  async getLocation(locationId: LocationId): Promise<Location> {
    return this.restClient.get({
      path: `/api/locations/${locationId}?includeInactive=true`,
    })
  }

  async getUsersLocations(): Promise<Location[]> {
    return this.restClient.get({
      path: `/api/users/me/locations`,
    })
  }

  async getAdjudicationLocations(agencyId: string): Promise<Location[]> {
    return this.restClient.get({
      path: `/api/agencies/${agencyId}/locations/type/ADJU`,
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

  async getMovementByOffender(offenderNo: string): Promise<OffenderMovementInfo[]> {
    return this.restClient.post({
      path: `/api/movements/offenders?movementType=ADM&latestOnly=false&allBookings=false`,
      data: [offenderNo],
    })
  }

  async validateCharge(chargeNumber: string, status: SanctionStatus, offenderNo: string): Promise<{ status: number }> {
    return this.restClient.get({
      path: `/api/adjudications/adjudication/${chargeNumber}/sanction/${status}/${offenderNo}/validate`,
    })
  }
}
