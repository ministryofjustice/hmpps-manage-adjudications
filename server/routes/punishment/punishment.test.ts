import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'

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

describe('GET /punishment', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a new punishment')
      })
  })
})

describe('POST /punishment', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishment.urls.start(100)}`)
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'nintendo switch',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentSchedule.urls.start(
          100
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`
      )
  })
})
