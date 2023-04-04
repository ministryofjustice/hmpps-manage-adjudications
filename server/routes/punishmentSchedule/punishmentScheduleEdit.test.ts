import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'

jest.mock('../../services/userService')

const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /punishment-schedule', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentSchedule.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment-schedule', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentSchedule.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Punishment schedule')
      })
  })
})
