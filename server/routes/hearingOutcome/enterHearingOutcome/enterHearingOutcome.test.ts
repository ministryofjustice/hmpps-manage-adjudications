import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'

jest.mock('../../../services/userService')

const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-outcome', () => {
  it('should load the `Enter hearing outcome` page', () => {
    return request(app)
      .get(adjudicationUrls.enterHearingOutcome.urls.start(100, 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the hearing outcome')
      })
  })
})

describe('POST /hearing-outcome', () => {
  it('should redirect to the correct URL - refer to police', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start(100, 1))
      .send({
        hearingOutcome: 'REFER_POLICE',
        adjudicatorName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          100,
          1
        )}?adjudicatorName=Roxanne%20Red&hearingOutcome=REFER_POLICE`
      )
  })
  it('should redirect to the correct URL - refer to independent adjudicator', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start(100, 1))
      .send({
        hearingOutcome: 'REFER_INAD',
        adjudicatorName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          100,
          1
        )}?adjudicatorName=Roxanne%20Red&hearingOutcome=REFER_INAD`
      )
  })
  it('should redirect to the correct URL - complete', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start(100, 1))
      .send({
        hearingOutcome: 'COMPLETE',
        adjudicatorName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingPleaAndFinding.urls.start(
          100,
          1
        )}?adjudicatorName=Roxanne%20Red&hearingOutcome=COMPLETE`
      )
  })
  it('should redirect to the correct URL - adjourn', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start(100, 1))
      .send({
        hearingOutcome: 'ADJOURN',
        adjudicatorName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingAdjourned.urls.start(100, 1)}?adjudicatorName=Roxanne%20Red&hearingOutcome=ADJOURN`
      )
  })
})
