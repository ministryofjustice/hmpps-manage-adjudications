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

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { hearingsService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingsCheckAnswers.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.hearingsCheckAnswers.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers before submitting')
      })
  })
})

describe('POST', () => {
  it('should successfully call the endpoint and redirect - no amount given', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=`)
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentsAndDamages.urls.review(100))
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
  it('should successfully call the endpoint and redirect - no amount given', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=500.0`
      )
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentsAndDamages.urls.review(100))
      .then(() =>
        expect(hearingsService.createChargedProvedHearingOutcome).toHaveBeenCalledWith(
          100,
          'Roxanne Red',
          HearingOutcomePlea.GUILTY,
          true,
          expect.anything(),
          '500.0'
        )
      )
  })
  it('should not call the endpoint if query parameters are missing, instead redirecting them to enter the hearing outcome page', () => {
    return request(app)
      .post(adjudicationUrls.hearingsCheckAnswers.urls.start(100))
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.start(100))
      .then(() => expect(hearingsService.createChargedProvedHearingOutcome).not.toHaveBeenCalled())
  })
})