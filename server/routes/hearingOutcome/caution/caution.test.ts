import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /is-caution', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.isThisACaution.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /is-caution', () => {
  it('should load the `is caution` page', () => {
    return request(app)
      .get(adjudicationUrls.isThisACaution.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Is the punishment a caution?')
      })
  })
})

describe('POST /is-caution', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.isThisACaution.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=`)
      .send({
        caution: 'yes',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() =>
        expect(hearingsService.createChargedProvedHearingOutcome).toHaveBeenCalledWith(
          100,
          'Roxanne Red',
          HearingOutcomePlea.GUILTY,
          true,
          expect.anything(),
          null
        )
      )
  })
})
