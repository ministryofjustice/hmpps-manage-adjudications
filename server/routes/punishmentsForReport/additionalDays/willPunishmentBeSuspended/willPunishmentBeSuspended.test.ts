import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET will this punishment be suspended page', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET punishment-suspended page', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Will this punishment be suspended?')
      })
  })
})

describe('POST punishment-suspended page', () => {
  it('should save data - suspended', () => {
    return request(app)
      .post(
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=5`
      )
      .send({
        suspended: 'yes',
        suspendedUntil: '13/4/2024',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=5`
      )
  })
  it('should redirect - not suspended', () => {
    return request(app)
      .post(
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=5`
      )
      .send({
        suspended: 'no',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.isPunishmentConsecutive.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=5`
      )
  })
})
