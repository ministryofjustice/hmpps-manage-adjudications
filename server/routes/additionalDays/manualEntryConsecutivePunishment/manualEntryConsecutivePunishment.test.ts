import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.validateChargeNumber.mockResolvedValue(true)
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
      .get(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start('100'))
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
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start('100')}?punishmentType=ADDITIONAL_DAYS`
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
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&days=5`
      )
      .send({
        consecutiveChargeNumber: 1234567,
      })
      .then(() => {
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.ADDITIONAL_DAYS,
            days: 5,
            consecutiveReportNumber: 1234567,
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
          },
          '100'
        )
      })
  })
  //   TODO: add test about redirecting to new page when charge number is invalid
})
