import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

jest.mock('../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
})

const reportedAdjudicationInformation = {
  reportExpirationDateTime: '2020-12-23T07:21',
  prisonerFirstName: 'John',
  prisonerLastName: 'Smith',
  prisonerNumber: 'H5123BY',
}

reportedAdjudicationsService.getConfirmationDetailsChangedReport.mockResolvedValue(reportedAdjudicationInformation)

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner-placed-on-report - edited adjudication', () => {
  it('should load the confirmation of placed on report page', () => {
    return request(app)
      .get('/prisoner-placed-on-report/123/changes-confirmed/report')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('John Smith’s report has been changed')
        expect(res.text).toContain('You must follow local processes.')
        expect(res.text).toContain('They need to receive this by 07:21 on 23 December 2020.')
      })
  })

  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.getConfirmationDetailsChangedReport.mockRejectedValue(
      new Error('error message content')
    )
    return request(app)
      .get('/prisoner-placed-on-report/123/changes-confirmed/report')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
