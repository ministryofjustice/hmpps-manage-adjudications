import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import config from '../../config'

jest.mock('../../services/userService.ts')

const userService = new UserService(null, null) as jest.Mocked<UserService>

let app: Express
const defaultConfig = config

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService })
  userService.getUserRoles.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
  config.maintenanceModeFlag = defaultConfig.maintenanceModeFlag
})

describe('GET /planned-maintenance', () => {
  it('should get the maintenance page', () => {
    config.maintenanceModeFlag = true
    return request(app)
      .get(adjudicationUrls.maintenancePage.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudications')
      })
  })
  it('should not display the maintenance page', () => {
    config.maintenanceModeFlag = false
    return request(app)
      .get(adjudicationUrls.maintenancePage.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudications')
      })
      .expect(res => {
        expect(res.text).toContain('404')
        expect(res.text).toContain('Not found')
      })
  })
})
