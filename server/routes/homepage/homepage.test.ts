import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import UserService from '../../services/userService'
import { homepageUrl } from '../../utils/urlGenerator'

jest.mock('../../services/userService.ts')

const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService })
  userService.getUserRoles.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /place-a-prisoner-on-report', () => {
  it('should get the home page', () => {
    return request(app)
      .get(homepageUrl.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Place a prisoner on report')
      })
  })
  it('the review tile should not be visible without the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['NOT_THE_ADJUDICATIONS_REVIEWER_ROLE'])
    return request(app)
      .get(homepageUrl.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).not.toContain('View all completed reports')
      })
  })
  it('the review tile should not be visible without the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .get(homepageUrl.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('View all completed reports')
      })
  })
})
