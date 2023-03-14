import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

jest.mock('../../../services/userService')
jest.mock('../../../services/reportedAdjudicationsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /money-recovered', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /money-recovered', () => {
  it('should load the `Damages owed page` page', () => {
    return request(app)
      .get(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Is any money being recovered for damages?')
      })
  })
})

describe('POST /money-recovered', () => {
  it('should pass the amount to the next page', () => {
    return request(app)
      .post(`${adjudicationUrls.moneyRecoveredForDamages.urls.start(100)}?adjudicator=test&plea=GUILTY`)
      .send({
        damagesOwed: 'yes',
        amount: '100.10',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.isThisACaution.urls.start(100)}?adjudicator=test&plea=GUILTY&amount=100.10`
      )
  })
  it('should  not pass the amount to the next page', () => {
    return request(app)
      .post(`${adjudicationUrls.moneyRecoveredForDamages.urls.start(100)}?adjudicator=test&plea=GUILTY`)
      .send({
        damagesOwed: 'no',
        amount: null,
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.isThisACaution.urls.start(100)}?adjudicator=test&plea=GUILTY&amount=`)
  })
  it('should return to outcome page if missing adjudicator', () => {
    return request(app)
      .post(`${adjudicationUrls.moneyRecoveredForDamages.urls.start(100)}?plea=GUILTY`)
      .send({
        damagesOwed: 'yes',
        amount: '100.10',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.start(100))
  })
})
