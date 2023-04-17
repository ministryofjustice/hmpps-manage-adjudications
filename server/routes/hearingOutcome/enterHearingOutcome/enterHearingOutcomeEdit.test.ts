import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import TestData from '../../testutils/testData'
import { HearingOutcomeCode } from '../../../data/HearingAndOutcomeResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
const testData = new TestData()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, hearingsService }, {})
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

describe('GET /hearing-outcome - edit', () => {
  it('should load the `Enter hearing outcome` page', () => {
    return request(app)
      .get(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the hearing outcome')
      })
  })
})

describe('POST /hearing-outcome - edit', () => {
  it('should redirect to the correct URL - refer to police (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'REFER_POLICE',
        adjudicatorName: 'Judge Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100
        )}?adjudicator=Judge%20Red&hearingOutcome=REFER_POLICE`
      )
  })
  it('should redirect to the correct URL - refer to independent adjudicator (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'REFER_INAD',
        adjudicatorName: 'Judge Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=REFER_INAD`
      )
  })
  it('should redirect to the correct URL - complete (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'COMPLETE',
        adjudicatorName: 'Judge Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
  })
  it('should redirect to the correct URL - adjourn (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'ADJOURN',
        adjudicatorName: 'Judge Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingAdjourned.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=ADJOURN`
      )
  })
})
