import { Express } from 'express'
import request from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockResolvedValue({
    type: PunishmentType.ADDITIONAL_DAYS,
    days: 5,
    suspendedUntil: '4/4/2023',
  })
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
      .get(adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET punishment-suspended page', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.edit('100', uuidv4()))
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
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=5`
      )
      .send({
        suspended: 'yes',
        suspendedUntil: '14/4/2024',
      })
      .expect(
        'Location',
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=5`
      )
  })
  it('should redirect - not suspended', () => {
    return request(app)
      .post(
        `${adjudicationUrls.isPunishmentSuspendedAdditionalDays.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=6`
      )
      .send({
        suspended: 'no',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.isPunishmentConsecutive.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=6`
      )
  })
})
