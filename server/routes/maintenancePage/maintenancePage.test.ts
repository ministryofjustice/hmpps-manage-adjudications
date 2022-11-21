import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

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

describe('GET /planned-maintenance', () => {
  it('should get the maintenance page', () => {
    return request(app)
      .get(adjudicationUrls.maintenancePage.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudications')
      })
  })
})
