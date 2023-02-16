import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
} from '../../../data/HearingAndOutcomeResult'
import TestData from '../../testutils/testData'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const testData = new TestData()
const userService = new UserService(null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  hearingsService.getHearingOutcome.mockResolvedValue(
    testData.hearingOutcome({
      code: HearingOutcomeCode.ADJOURN,
      optionalItems: { details: 'adjourn details' },
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-adjourned', () => {
  it('should load the `Reason for referral` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingAdjourned.urls.edit(100, 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjourn the hearing for another reason')
      })
  })
})

describe('POST /hearing-adjourned', () => {
  it('should successfully call the endpoint and redirect to the confirmation page', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingAdjourned.urls.edit(100, 1)}?adjudicatorName=Roxanne%20Red&hearingOutcome=ADJOURN`
      )
      .send({
        adjournReason: HearingOutcomeAdjournReason.INVESTIGATION,
        adjournDetails: '123',
        adjournPlea: HearingOutcomePlea.UNFIT,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() =>
        expect(hearingsService.updateAdjourn).toHaveBeenCalledWith(
          100,
          HearingOutcomeCode.ADJOURN,
          'Roxanne Red',
          '123',
          HearingOutcomeAdjournReason.INVESTIGATION,
          HearingOutcomePlea.UNFIT,
          expect.anything()
        )
      )
  })
})
