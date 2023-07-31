import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PunishmentType } from '../../../data/PunishmentResult'
import config from '../../../config'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  config.addedDaysFlag = 'true'
  punishmentsService.getSessionPunishment.mockResolvedValue({
    type: PunishmentType.ADDITIONAL_DAYS,
    days: 10,
    suspendedUntil: '4/4/2023',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET number of additional days page', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.numberOfAdditionalDays.urls.manualEdit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET number of additional days page', () => {
  it('should load the  page', () => {
    return request(app)
      .get(adjudicationUrls.numberOfAdditionalDays.urls.manualEdit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the number of additional days')
      })
  })
})

describe('POST number of additional days page', () => {
  it('should redirect', () => {
    return request(app)
      .post(
        `${adjudicationUrls.numberOfAdditionalDays.urls.manualEdit(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=`
      )
      .send({
        days: 10,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&privilegeType=&otherPrivilege=&stoppagePercentage=&days=10`
      )
  })
})
