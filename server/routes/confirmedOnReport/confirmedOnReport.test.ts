import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
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

reportedAdjudicationsService.getSimpleConfirmationDetails.mockResolvedValue(reportedAdjudicationInformation)

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner-placed-on-report', () => {
  it('should load the confirmation of placed on report page', () => {
    return request(app)
      .get(adjudicationUrls.confirmedOnReport.urls.start(123))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Your report for John Smith has been submitted for review')
        expect(res.text).toContain('123')
        expect(res.text).toContain('This report will be reviewed. The reviewer can do one of 3 thing')
      })
  })

  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.getSimpleConfirmationDetails.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get(adjudicationUrls.confirmedOnReport.urls.start(123))

      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
