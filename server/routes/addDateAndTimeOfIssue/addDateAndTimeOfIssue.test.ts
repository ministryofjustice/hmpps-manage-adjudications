import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import TestData from '../testutils/testData'

jest.mock('../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const testData = new TestData()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
  reportedAdjudicationsService.issueDISForm.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({ chargeNumber: '12345', prisonerNumber: 'G6123VU' }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /add-issue-date-time', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.addIssueDateTime.urls.start('12345'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add date and time')
      })
  })
})

describe('POST /add-issue-date-time', () => {
  it('should redirect back to the confirm issued forms page on a successful submit', () => {
    return request(app)
      .post(adjudicationUrls.addIssueDateTime.urls.start('12345'))
      .send({ issuedDate: { date: '09/12/2022', time: { hour: '09', minute: '30' } } })
      .expect(() => {
        expect(reportedAdjudicationsService.issueDISForm).toBeCalledTimes(1)
        expect(reportedAdjudicationsService.issueDISForm).toBeCalledWith('12345', '2022-12-09T09:30', expect.anything())
      })
      .expect(302)
      .expect('Location', adjudicationUrls.confirmDISFormsIssued.urls.start())
  })
})
