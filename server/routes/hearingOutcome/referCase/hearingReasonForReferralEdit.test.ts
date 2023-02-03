import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomeCode } from '../../../data/HearingResult'
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
      code: HearingOutcomeCode.REFER_POLICE,
      optionalItems: { details: 'A reason for referral' },
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /reason-for-referral', () => {
  it('should load the `Reason for referral` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingReasonForReferral.urls.edit(100, 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for the referral?')
      })
  })
})

describe('POST /reason-for-referral', () => {
  it('should successfully call the endpoint and redirect to the confirmation page', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100,
          1
        )}?adjudicatorName=Roxanne%20Red&hearingOutcome=REFER_POLICE`
      )
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReferralConfirmation.urls.start(100))
      .then(() =>
        expect(hearingsService.updateHearingReferralOutcome).toHaveBeenCalledWith(
          100,
          1,
          HearingOutcomeCode.REFER_POLICE,
          'Roxanne Red',
          '123',
          expect.anything()
        )
      )
  })
  it('should redirect the user back to the enter hearing outcome edit page if the adjudicator name and/or hearing outcome has been tampered lost', () => {
    return request(app)
      .post(adjudicationUrls.hearingReasonForReferral.urls.edit(100, 1))
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.edit(100, 1))
  })
  it('should redirect the user back to the enter hearing outcome edit page if the hearing outcome has been tampered with', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100,
          1
        )}?adjudicatorName=Roxanne%20Red&hearingOutcome=NOT_IN_ENUM`
      )
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.edit(100, 1))
  })
  it('should redirect the user back to the enter hearing outcome edit page if the hearing outcome is not a REFER enum', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100,
          1
        )}?adjudicatorName=Roxanne%20Red&hearingOutcome=ADJOURN`
      )
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.edit(100, 1))
  })
})
