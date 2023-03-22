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
  it('should load deletion request confirmation page', () => {
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

describe('sGET /delete-report/:id', () => {
  it('should delete report, then load select report page', () => {
    return request(app)
      .get(adjudicationUrls.deleteReport.urls.delete(10))
      .expect(() => {
        expect(placeOnReportService.removeDraftAdjudication).toBeCalledTimes(1)
        expect(placeOnReportService.removeDraftAdjudication).toBeCalledWith(10, expect.anything())
      })
      .expect('Location', '/select-report')
  })
})
