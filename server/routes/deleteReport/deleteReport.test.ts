import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /delete-report/:id', () => {
  beforeEach(() => {
    placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(
      testData.prisonerResultSummary({
        firstName: 'John',
        lastName: 'Smith',
        offenderNo: 'A1234AA',
      }),
    )
  })
  it('should load deletion request confirmation page', () => {
    return request(app)
      .get(adjudicationUrls.deleteReport.urls.delete(1041))
      .expect(() => {
        expect(placeOnReportService.getPrisonerDetailsFromAdjNumber).toHaveBeenCalledWith(1041, expect.anything())
      })
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Are you sure you want to delete this report?')
        expect(response.text).toContain('src="/prisoner/A1234AA/image"')
        expect(response.text).toContain('Smith, John')
        expect(response.text).toContain('1-2-015')
        expect(response.text).toContain('Delete report')
        expect(response.text).toContain('Cancel')
      })
  })
})

describe('POST /delete-report/:id', () => {
  it('should delete report, then load select report page', () => {
    return request(app)
      .post(adjudicationUrls.deleteReport.urls.delete(10))
      .expect(() => {
        expect(placeOnReportService.removeDraftAdjudication).toHaveBeenCalledTimes(1)
        expect(placeOnReportService.removeDraftAdjudication).toHaveBeenCalledWith(10, expect.anything())
      })
      .expect('Location', '/select-report')
  })
})
