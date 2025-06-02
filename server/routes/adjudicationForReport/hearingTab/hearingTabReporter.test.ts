import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'
import OutcomesService from '../../../services/outcomesService'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const outcomesService = new OutcomesService() as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber: '1524493',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      prisonerNumber: 'G6415GD',
      outcomes: [],
    }),
  })
  reportedAdjudicationsService.getTransferBannerInfo.mockResolvedValue({
    transferBannerContent: null,
    originatingAgencyToAddOutcome: false,
  })
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, outcomesService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET hearing details page - reporter version', () => {
  it('should load the hearing details page with no history on adjudication - status AWAITING_REVIEW', () => {
    reportedAdjudicationsService.getOutcomesHistory.mockResolvedValue([])
    reportedAdjudicationsService.getPrimaryButtonInfoForHearingDetails.mockResolvedValue(null as never)

    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.report('1524493'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('There are no hearings to schedule at the moment.')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
      })
  })
})
