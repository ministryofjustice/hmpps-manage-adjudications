import { Express } from 'express'
import request from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PunishmentType } from '../../../data/PunishmentResult'
import config from '../../../config'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockResolvedValue({
    consecutiveReportNumber: '7654321',
    type: PunishmentType.ADDITIONAL_DAYS,
    days: 10,
  })
  punishmentsService.validateChargeNumber.mockResolvedValue(true)
  config.addedDaysFlag = 'true'
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
    config.addedDaysFlag = 'true'
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.edit(
          '100',
          uuidv4()
        )}?punishmentType=ADDITIONAL_DAYS`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Which charge will it be consecutive to?')
      })
  })
})

describe('POST', () => {
  it('should add punishment to session with consecutive punishment report number present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.edit(
          '100',
          'XYZ'
        )}?punishmentType=ADDITIONAL_DAYS&days=5`
      )
      .send({
        consecutiveChargeNumber: 1234567,
      })
      .then(() => {
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.ADDITIONAL_DAYS,
            days: 5,
            consecutiveReportNumber: 1234567,
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
          },
          '100',
          'XYZ'
        )
      })
  })
  //   TODO: add test about redirecting to new page when charge number is invalid
})
