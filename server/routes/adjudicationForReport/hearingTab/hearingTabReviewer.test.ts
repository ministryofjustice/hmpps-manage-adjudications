import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'
import { HearingOutcomeCode, HearingOutcomePlea, OutcomeCode } from '../../../data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import OutcomesService from '../../../services/outcomesService'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService() as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber: '1524493',
      prisonerNumber: 'G6415GD',
      outcomes: [],
    }),
  })
  reportedAdjudicationsService.getTransferBannerInfo.mockResolvedValue({
    transferBannerContent: null,
    originatingAgencyToAddOutcome: false,
  })
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService, outcomesService }, {})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET hearing details page - reviewer version', () => {
  it('should load the hearing details page with no hearings on adjudication - status AWAITING_REVIEW', () => {
    reportedAdjudicationsService.getOutcomesHistory.mockResolvedValue([])
    reportedAdjudicationsService.getPrimaryButtonInfoForHearingDetails.mockResolvedValue(null as never)
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.review('1524493'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('There are no hearings to schedule at the moment.')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
      })
  })
  it('should load the hearing details page with history present', () => {
    const hearing = {
      ...testData.singleHearing({
        dateTimeOfHearing: '2023-03-01T17:00:00',
        outcome: testData.hearingOutcome({
          code: HearingOutcomeCode.COMPLETE,
          optionalItems: {
            plea: HearingOutcomePlea.GUILTY,
          },
        }),
      }),
    }
    const outcome = testData.outcome({
      code: OutcomeCode.CHARGE_PROVED,
    })
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '1524495',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        prisonerNumber: 'G6415GD',
        outcomes: [
          {
            hearing,
            outcome: {
              outcome,
            },
          },
        ],
      }),
    })

    reportedAdjudicationsService.getOutcomesHistory.mockResolvedValue([
      {
        hearing: {
          ...hearing,
          locationName: 'Moorland Closed (HMP & YOI)',
          convertedAdjudicator: 'J. Red',
        },
        outcome,
      },
    ])
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.review('1524495'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Charge proved beyond reasonable doubt')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
      })
  })
})
describe('POST cancel hearing', () => {
  it('should call the cancel endpoint if user cancels a hearing', () => {
    return request(app)
      .post(adjudicationUrls.hearingDetails.urls.review('1524494'))
      .send({ removeHearingButton: 'cancelHearingButton-101' })
      .expect(() => {
        expect(reportedAdjudicationsService.deleteHearing).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.deleteHearing).toHaveBeenCalledWith('1524494', expect.anything())
      })
  })
})
