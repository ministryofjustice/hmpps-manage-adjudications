import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { OicHearingType, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
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
    }),
  })
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber: 1524494,
      prisonerNumber: 'G6415GD',
      status: ReportedAdjudicationStatus.SCHEDULED,
      hearings: [testData.singleHearing('2022-10-24T12:54:09.197Z')],
    }),
  })

  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET prisoner report', () => {
  it('should load the hearing details page - reviewer version - no hearings', () => {
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.review(1524493))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Not scheduled.')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledTimes(1)
      })
  })
  it('should load the hearing details page - reviewer version - one hearing', () => {
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
      },
    ])
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.review(1524494))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledWith(
          1524494,
          expect.anything()
        )
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledWith(
          [testData.singleHearing('2022-10-24T12:54:09.197Z')],
          expect.anything()
        )
        expect(response.text).toContain('Hearing 1')
        expect(response.text).toContain('Cancel this hearing')
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
      },
    ])
    return request(app)
      .post(adjudicationUrls.hearingDetails.urls.review(1524494))
      .send({ cancelHearingButton: 'cancelHearingButton-101' })
      .expect(() => {
        expect(reportedAdjudicationsService.deleteHearing).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.deleteHearing).toHaveBeenCalledWith(1524494, 101, expect.anything())
      })
  })
})
