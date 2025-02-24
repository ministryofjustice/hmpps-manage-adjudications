import config from '../config'
import RestClient from './restClient'
import { alertCodeString } from '../utils/alertHelper'
import logger from '../../logger'

export type Alert = {
  alertId: string
  bookingId: number
  offenderNo: string
  alertType: string
  alertTypeDescription: string
  alertCode: string
  alertCodeDescription: string
  comment: string
  dateCreated: string
  dateExpires: string
  expired: boolean
  active: boolean
  addedByFirstName: string
  addedByLastName: string
  expiredByFirstName: string
  expiredByLastName: string
}

export type PrisonerAlerts = {
  prisonerNumber: string
  alerts: Alert[]
}

export type PaginatedAlertResponse = {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  content: NewAlert[]
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  pageable: {
    offset: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    pageSize: number
    paged: boolean
    pageNumber: number
    unpaged: boolean
  }
  empty: boolean
}

export type NewAlert = {
  alertUuid: string
  prisonNumber: string
  alertCode: {
    alertTypeCode: string
    alertTypeDescription: string
    code: string
    description: string
  }
  description: string
  authorisedBy: string
  activeFrom: string
  activeTo: string
  isActive: boolean
  createdAt: string
  createdBy: string
  createdByDisplayName: string
  lastModifiedAt: string
  lastModifiedBy: string
  lastModifiedByDisplayName: string
  activeToLastSetAt: string
  activeToLastSetBy: string
  activeToLastSetByDisplayName: string
}

export default class AlertApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Alert API', config.apis.alert, token)
  }

  async getAlertsForPrisoner(prisonerNumber: string): Promise<PrisonerAlerts> {
    let paginatedAlerts: PaginatedAlertResponse | undefined
    try {
      paginatedAlerts = await this.restClient.get<PaginatedAlertResponse>({
        path: `/offenders/${prisonerNumber}/alerts?alertCode=${alertCodeString}`,
      })
    } catch (error) {
      if (error.status === 404) {
        logger.info(`No alerts available for prisonerNumber: ${prisonerNumber}`)
      } else {
        throw error
      }
    }

    const newAlerts: NewAlert[] = paginatedAlerts?.content || []

    // Convert `NewAlert` items into your existing `Alert`:
    const alerts: Alert[] = newAlerts.map(a => {
      const activeToDate = a.activeTo ? new Date(a.activeTo) : null
      const expired = activeToDate ? activeToDate.getTime() < Date.now() : false
      return {
        alertId: a.alertUuid,
        offenderNo: a.prisonNumber,
        alertCode: a.alertCode.code,
        alertCodeDescription: a.alertCode.description,
        alertType: a.alertCode.alertTypeCode,
        alertTypeDescription: a.alertCode.alertTypeDescription,
        active: a.isActive,
        comment: a.description,
        dateCreated: a.createdAt,
        dateExpires: a.activeTo,
        addedByFirstName: a.createdBy,
        addedByLastName: a.createdByDisplayName,
        expired,
        expiredByFirstName: '',
        expiredByLastName: '',
        bookingId: 0,
      }
    })

    return {
      prisonerNumber,
      alerts: alerts || [],
    }
  }
}
