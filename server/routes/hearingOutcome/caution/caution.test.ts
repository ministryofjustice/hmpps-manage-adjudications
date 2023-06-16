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

describe('GET /is-caution', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService }, {})
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
  it('should successfully call the endpoint and redirect if answer is no', () => {
    return request(app)
      .post(`${adjudicationUrls.isThisACaution.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=`)
      .send({
        caution: 'no',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingsCheckAnswers.urls.start(
          100
        )}?adjudicator=Roxanne%20Red&amount=&plea=GUILTY&damagesOwed=&caution=no`
      )
  })
  it('should not call the endpoint and redirect to the check answers page if answer is yes', () => {
    return request(app)
      .post(`${adjudicationUrls.isThisACaution.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=`)
      .send({
        caution: 'yes',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingsCheckAnswers.urls.start(
          100
        )}?adjudicator=Roxanne%20Red&amount=&plea=GUILTY&damagesOwed=&caution=yes`
      )
  })
})
