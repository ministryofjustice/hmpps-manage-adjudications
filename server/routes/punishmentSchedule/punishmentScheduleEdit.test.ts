import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'

jest.mock('../../services/userService')
jest.mock('../../services/punishmentsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService() as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /punishment-schedule', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
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
