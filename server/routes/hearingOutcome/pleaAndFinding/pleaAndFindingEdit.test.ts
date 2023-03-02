import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomeFinding, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, hearingsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-plea-finding edit', () => {
  it('should load the `Plea and finding` edit page', () => {
    return request(app)
      .get(adjudicationUrls.hearingPleaAndFinding.urls.edit(100, 1))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Plea and finding')
      })
  })
})

describe('POST /hearing-plea-finding edit', () => {
  it('should redirect to the correct URL after correct submission - proved finding', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.CHARGE_PROVED,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.moneyRecoveredForDamages.urls.edit(100))
  })
  it('should redirect to the correct URL after correct submission - dismissed finding', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.DISMISSED,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReasonForFinding.urls.edit(100))
  })
  it('should redirect to the correct URL after correct submission - not proceeded with finding', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.NOT_PROCEED,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.reasonForNotProceeding.urls.edit(100))
  })
})
