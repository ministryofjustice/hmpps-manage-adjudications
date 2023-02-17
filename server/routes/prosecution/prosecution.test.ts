import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'

jest.mock('../../services/userService')
jest.mock('../../services/hearingsService')

const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prosecution', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.prosecution.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /prosecution', () => {
  it('should load the `Prosecution` page', () => {
    return request(app)
      .get(adjudicationUrls.prosecution.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Will this charge continue to prosecution?')
      })
  })
})

describe('POST /prosecution', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.prosecution.urls.start(100)}`)
      .send({
        prosecutionChosen: 'yes',
        nextStepChosen: null,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
  })
})
