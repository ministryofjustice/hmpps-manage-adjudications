import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import TestData from '../../testutils/testData'

const testData = new TestData()

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')
jest.mock('../../../services/reportedAdjudicationsService')

const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

const outcomeHistory = {
  hearing: testData.singleHearing({
    dateTimeOfHearing: '2023-03-10T22:00:00',
  }),
  outcome: {
    outcome: testData.outcome({ details: 'something' }),
  },
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, hearingsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue(outcomeHistory)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /reason-for-finding', () => {
  it('should load the `Reason for finding` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingReasonForFinding.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for this finding')
      })
  })
})

describe('POST /reason-for-finding', () => {
  it('should redirect to the correct URL after correct submission', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingReasonForFinding.urls.edit(100)}`)
      .send({
        reasonForFinding: 'This is a reason',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() =>
        expect(hearingsService.editDismissedOutcome).toHaveBeenCalledWith(
          100,
          'This is a reason',
          expect.anything(),
          null,
          null
        )
      )
  })
})
