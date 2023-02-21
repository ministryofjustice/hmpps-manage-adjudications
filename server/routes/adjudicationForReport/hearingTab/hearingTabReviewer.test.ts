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
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber: 1524493,
      prisonerNumber: 'G6415GD',
      history: [],
    }),
  })
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService }, {}, 'true')
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET hearing details page - reviewer version', () => {
  it('should load the hearing details page with no hearings on adjudication - status AWAITING_REVIEW', () => {
    reportedAdjudicationsService.getHearingHistory.mockResolvedValue([])
    reportedAdjudicationsService.getPrimaryButtonInfoForHearingDetails.mockResolvedValue(null as never)
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.review(1524493))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('There are no hearings to schedule at the moment.')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
      })
  })
})
describe('POST cancel hearing', () => {
  it('should call the cancel endpoint if user cancels a hearing', () => {
    reportedAdjudicationsService.getHearingDetails.mockResolvedValue([
      {
        id: 101,
        dateTime: {
          label: 'Date and time of hearing',
          value: '24 October 2022 - 12:54',
        },
        location: {
          label: 'Location',
          value: 'Adj 2',
        },
        type: {
          label: 'Type of hearing',
          value: 'Governor',
        },
      },
    ])
    return request(app)
      .post(adjudicationUrls.hearingDetails.urls.review(1524494))
      .send({ removeHearingButton: 'cancelHearingButton-101' })
      .expect(() => {
        expect(reportedAdjudicationsService.deleteHearing).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.deleteHearing).toHaveBeenCalledWith(1524494, expect.anything())
      })
  })
})
