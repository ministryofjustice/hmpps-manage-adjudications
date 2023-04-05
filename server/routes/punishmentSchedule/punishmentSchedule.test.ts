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

describe('GET /punishment-schedule', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentSchedule.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment-schedule', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentSchedule.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Punishment schedule')
      })
  })
})

describe('POST /punishment-schedule', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentSchedule.urls.start(
          100
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`
      )
      .send({
        days: 10,
        suspended: 'no',
        startDate: '3/4/2023',
        endDate: '13/4/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentsAndDamages.urls.review(100))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.OTHER,
            otherPrivilege: 'nintendo switch',
            days: 10,
            startDate: '3/4/2023',
            endDate: '13/4/2023',
            stoppagePercentage: null,
            suspendedUntil: null,
          },
          100
        )
      )
  })
})
