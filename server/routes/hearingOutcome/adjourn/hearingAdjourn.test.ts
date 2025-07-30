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

describe('GET /hearing-adjourned', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingAdjourned.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /hearing-adjourned', () => {
  it('should load the `Hearing Adjourned` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingAdjourned.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjourn the hearing for another reason')
      })
  })
})

describe('POST /hearing-adjourned', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingAdjourned.urls.start('100')}?adjudicator=Roxanne%20Red&hearingOutcome=ADJOURN`)
      .send({
        adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
        adjournDetails: '123',
        adjournPlea: HearingOutcomePlea.NOT_ASKED,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review('100'))
      .then(() =>
        expect(hearingsService.createAdjourn).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.ADJOURN,
          'Roxanne Red',
          '123',
          HearingOutcomeAdjournReason.EVIDENCE,
          HearingOutcomePlea.NOT_ASKED,
          expect.anything(),
        ),
      )
  })
})
