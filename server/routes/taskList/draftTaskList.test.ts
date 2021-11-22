import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25928,
      description: '4-2-001',
      agencyName: 'Moorland (HMP & YOI)',
    },
    categoryCode: undefined,
    language: 'English',
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /place-the-prisoner-on-report', () => {
  describe('with results', () => {
    beforeEach(() => {
      placeOnReportService.getInfoForTaskListStatuses.mockResolvedValue({
        handoverDeadline: '2021-11-23T00:00:00',
        statementPresent: true,
        statementComplete: true,
      })
    })
    it.only('should load the continue report page', () => {
      return request(app)
        .get('/place-the-prisoner-on-report/G6415GD/104')
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Incident details')
          expect(response.text).toContain('Incident statement')
          expect(response.text).toContain('Accept details and place on report')
          expect(response.text).toContain(
            'You need to provide Udfsanaye Aidetria with a printed copy of this report by 00:00 on 23 November 2021.'
          )
        })
    })
  })
})
