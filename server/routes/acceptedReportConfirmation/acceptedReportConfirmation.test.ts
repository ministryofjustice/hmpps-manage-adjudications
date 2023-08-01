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

const reportedAdjudicationInformation = {
  reportExpirationDateTime: '2020-12-23T07:21',
  prisonerFullName: 'John Smith',
  transferableActionsAllowed: true,
}
beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
  reportedAdjudicationsService.getAcceptedReportConfirmationDetails.mockResolvedValue(reportedAdjudicationInformation)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /report-has-been-accepted', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.acceptedReportConfirmation.urls.start(123))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(reportedAdjudicationsService.getAcceptedReportConfirmationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getAcceptedReportConfirmationDetails).toHaveBeenCalledWith(
          123,
          expect.anything()
        )
        expect(response.text).toContain('John Smith’s report has been accepted')
      })
  })

  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.getAcceptedReportConfirmationDetails.mockRejectedValue(
      new Error('error message content')
    )
    return request(app)
      .get(adjudicationUrls.acceptedReportConfirmation.urls.start(123))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
