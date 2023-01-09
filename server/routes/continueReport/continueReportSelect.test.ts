import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'UDFSANAYE',
      lastName: 'AIDETRIA',
      assignedLivingUnitDesc: '4-2-001',
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-report', () => {
  describe('with results', () => {
    beforeEach(() => {
      placeOnReportService.getAllDraftAdjudicationsForUser.mockResolvedValue([
        testData.draftAdjudication({
          id: 31,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2020-10-12T20:00:00',
          otherData: {
            displayName: 'Aidetria, Udfsanaye',
            friendlyName: 'Udfsanaye Aidetria',
            formattedDiscoveryDateTime: '22 December 2022 - 15:00',
          },
        }),
        testData.draftAdjudication({
          id: 58,
          prisonerNumber: 'G5966UI',
          dateTimeOfIncident: '2020-11-11T15:15:00',
          otherData: {
            displayName: 'Babik, Carroll',
            friendlyName: 'Carroll Babik',
            formattedDiscoveryDateTime: '22 December 2022 - 16:00',
          },
        }),
      ])
    })
    it('should load the continue report page', () => {
      return request(app)
        .get(adjudicationUrls.selectReport.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Continue a report')
          expect(response.text).toContain('Aidetria, Udfsanaye - G6415GD')
          expect(response.text).toContain('22 December 2022 - 15:00')
          expect(response.text).toContain('Continue report')
          expect(response.text).toContain('Babik, Carroll - G5966UI')
          expect(response.text).toContain('22 December 2022 - 16:00')
          expect(response.text).toContain('Continue')
        })
    })
  })
  describe('without results', () => {
    beforeEach(() => {
      placeOnReportService.getAllDraftAdjudicationsForUser.mockResolvedValue([])
    })
    it('shows default message', () => {
      return request(app)
        .get(adjudicationUrls.selectReport.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Continue a report')
          expect(response.text).toContain('There are no reports for you to continue.')
        })
    })
  })
})
