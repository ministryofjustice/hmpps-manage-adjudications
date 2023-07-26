import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Manually activate an existing suspended punishment')
      })
  })
})

describe('POST', () => {
  it('should redirect correctly', () => {
    return request(app)
      .post(`${adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100)}`)
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'chocolate',
        stoppagePercentage: null,
        reportNumber: '123456',
      })
      .expect(
        'Location',
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual(
          100
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=chocolate&stoppagePercentage=&reportNo=123456`
      )
  })

  it.each([PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS])(
    'should redirect to additional days',
    (punishmentType: string) => {
      return request(app)
        .post(`${adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100)}`)
        .send({
          punishmentType,
          reportNumber: '123456',
        })
        .expect(
          'Location',
          `${adjudicationUrls.numberOfAdditionalDays.urls.manualEdit(
            100
          )}?punishmentType=${punishmentType}&privilegeType=&otherPrivilege=&stoppagePercentage=&reportNo=123456`
        )
    }
  )
})
