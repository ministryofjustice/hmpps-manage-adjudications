import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomeCode, ReferGovReason } from '../../../data/HearingAndOutcomeResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /reason-for-referral', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /reason-for-referral', () => {
  it('should load the `Reason for referral` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for the referral?')
      })
  })
})

describe('POST /reason-for-referral', () => {
  it('should successfully call the endpoint and redirect - REFER_POLICE', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_POLICE`
      )
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      .then(() =>
        expect(hearingsService.createReferral).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.REFER_POLICE,
          'Roxanne Red',
          '123',
          undefined,
          expect.anything()
        )
      )
  })
  it('should successfully call the endpoint and redirect - REFER_GOV', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_GOV`
      )
      .send({
        referralReason: '123',
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      .then(() =>
        expect(hearingsService.createReferral).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.REFER_GOV,
          'Roxanne Red',
          '123',
          ReferGovReason.GOV_INQUIRY,
          expect.anything()
        )
      )
  })
  it('should redirect the user back to the enter hearing outcome page if the adjudicator name and/or hearing outcome has been tampered/lost', () => {
    return request(app)
      .post(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      .send({
        referralReason: '123',
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.start('100'))
  })
  it('should redirect the user back to the enter hearing outcome page if the hearing outcome has been tampered with', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Roxanne%20Red&hearingOutcome=NOT_IN_ENUM`
      )
      .send({
        referralReason: '123',
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.start('100'))
  })
  it('should redirect the user back to the enter hearing outcome page if the hearing outcome is not a REFER enum', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Roxanne%20Red&hearingOutcome=ADJOURN`
      )
      .send({
        referralReason: '123',
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.start('100'))
  })
})
