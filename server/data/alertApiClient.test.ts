import nock from 'nock'
import config from '../config'
import AlertApiClient, { PaginatedAlertResponse } from './alertApiClient'
import logger from '../../logger'
import { alertCodeString } from '../utils/alertHelper'

jest.mock('../../logger')

describe('AlertApiClient', () => {
  let fakeAlertApi: nock.Scope
  let client: AlertApiClient

  const token = 'token-1'
  const prisonerNumber = 'A1234AA'

  beforeEach(() => {
    // Create a nock scope for the "Alert" API
    fakeAlertApi = nock(config.apis.alert.url)
    client = new AlertApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAlertsForPrisoner', () => {
    it('should return mapped alerts when endpoint returns 200', async () => {
      // Create a mock paginated response with 1 item
      const mockResponse: PaginatedAlertResponse = {
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        size: 1,
        number: 0,
        sort: { empty: false, sorted: false, unsorted: true },
        numberOfElements: 1,
        empty: false,
        pageable: {
          offset: 0,
          sort: { empty: false, sorted: false, unsorted: true },
          pageSize: 1,
          paged: true,
          pageNumber: 0,
          unpaged: false,
        },
        content: [
          {
            alertUuid: 'uuid-123',
            prisonNumber: prisonerNumber,
            alertCode: {
              alertTypeCode: 'X',
              alertTypeDescription: 'Type Desc',
              code: 'XYZ',
              description: 'Code Desc',
            },
            description: 'Alert description',
            authorisedBy: 'Officer X',
            activeFrom: '2021-01-01',
            activeTo: '2100-12-31', // far future => not expired
            isActive: true,
            createdAt: '2021-01-01T00:00:00',
            createdBy: 'CREATOR',
            createdByDisplayName: 'Creator Display',
            lastModifiedAt: '2021-01-01T01:00:00',
            lastModifiedBy: 'CREATOR',
            lastModifiedByDisplayName: 'Creator Display',
            activeToLastSetAt: '2021-01-01T02:00:00',
            activeToLastSetBy: 'CREATOR',
            activeToLastSetByDisplayName: 'Creator Display',
          },
        ],
      }

      // Stub out the nock call
      fakeAlertApi
        .get(`/offenders/${prisonerNumber}/alerts?alertCode=${alertCodeString}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockResponse)

      // Call the client
      const result = await client.getAlertsForPrisoner(prisonerNumber)

      // Verify we got the correct mapped result
      expect(result.prisonerNumber).toBe(prisonerNumber)
      expect(result.alerts).toHaveLength(1)

      const [alert] = result.alerts
      expect(alert.alertId).toBe('uuid-123')
      expect(alert.offenderNo).toBe(prisonerNumber)
      expect(alert.alertCode).toBe('XYZ')
      expect(alert.alertType).toBe('X')
      expect(alert.expired).toBe(false)
    })

    it('should mark alerts as expired if activeTo is in the past', async () => {
      const pastDate = '2000-01-01'
      const mockResponse: PaginatedAlertResponse = {
        ...createEmptyPaginatedResponse(),
        content: [
          {
            ...createBaseNewAlert(prisonerNumber),
            activeTo: pastDate,
            isActive: true,
          },
        ],
      }

      fakeAlertApi
        .get(`/offenders/${prisonerNumber}/alerts?alertCode=${alertCodeString}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockResponse)

      const result = await client.getAlertsForPrisoner(prisonerNumber)

      expect(result.alerts).toHaveLength(1)
      expect(result.alerts[0].expired).toBe(true)
    })

    it('should log and return empty alerts if 404 is returned', async () => {
      fakeAlertApi
        .get(`/offenders/${prisonerNumber}/alerts?alertCode=${alertCodeString}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(404)

      const result = await client.getAlertsForPrisoner(prisonerNumber)

      expect(logger.info).toHaveBeenCalledWith(`No alerts available for prisonerNumber: ${prisonerNumber}`)
      expect(result.alerts).toEqual([])
      expect(result.prisonerNumber).toBe(prisonerNumber)
    })
  })
})

function createEmptyPaginatedResponse(): PaginatedAlertResponse {
  return {
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    size: 0,
    number: 0,
    numberOfElements: 0,
    empty: true,
    sort: { empty: true, sorted: false, unsorted: true },
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 0,
      paged: false,
      unpaged: true,
      sort: { empty: true, sorted: false, unsorted: true },
    },
    content: [],
  }
}

function createBaseNewAlert(prisonNumber: string) {
  return {
    alertUuid: 'uuid-1234',
    prisonNumber,
    alertCode: {
      alertTypeCode: 'A',
      alertTypeDescription: 'type-desc',
      code: 'ABC',
      description: 'alert-desc',
    },
    description: 'An alert',
    authorisedBy: 'An Officer',
    activeFrom: '2020-01-01',
    activeTo: '2030-01-01',
    isActive: true,
    createdAt: '2020-01-01T00:00:00',
    createdBy: 'USER1',
    createdByDisplayName: 'User One',
    lastModifiedAt: '2020-01-02T00:00:00',
    lastModifiedBy: 'USER1',
    lastModifiedByDisplayName: 'User One',
    activeToLastSetAt: '2020-01-02T00:00:00',
    activeToLastSetBy: 'USER1',
    activeToLastSetByDisplayName: 'User One',
  }
}
