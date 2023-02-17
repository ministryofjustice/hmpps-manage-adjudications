import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET hearing details page - reporter version', () => {
  it('should load the hearing details page with no history on adjudication - status AWAITING_REVIEW', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        adjudicationNumber: 1524493,
        prisonerNumber: 'G6415GD',
        history: [],
      }),
    })
    reportedAdjudicationsService.getHearingHistory.mockResolvedValue([])
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.report(1524493))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('There are no hearings to schedule at the moment.')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingHistory).toHaveBeenCalledTimes(1)
      })
  })
})
