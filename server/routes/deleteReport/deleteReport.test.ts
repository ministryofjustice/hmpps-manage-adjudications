import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /delete-report/:id/request-confirmation', () => {
  describe('with results', () => {
    beforeEach(() => {
      // placeOnReportService.removeDraftAdjudication.mockResolvedValue()
    })
    it('should load the continue report page', () => {
      return request(app)
        .get(adjudicationUrls.deleteReport.urls.requestConfirmation(10))
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Delete report')
          expect(response.text).toContain('Draft adjudication report will be deleted, please confirm.')
          expect(response.text).toContain('Delete')
          expect(response.text).toContain('Cancel')
          expect(response.text).toContain('href="/delete-report/10"')
        })
    })
  })
})
