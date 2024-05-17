import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

const consecutivePunishments = [
  {
    chargeNumber: '101',
    chargeProvedDate: '2023-07-18',
    punishment: {
      id: 1,
      type: PunishmentType.ADDITIONAL_DAYS,
      rehabilitativeActivities: [] as RehabilitativeActivity[],
      schedule: {
        duration: 5,
      },
    },
  },
  {
    chargeNumber: '102',
    chargeProvedDate: '2023-07-19',
    punishment: {
      id: 2,
      type: PunishmentType.ADDITIONAL_DAYS,
      rehabilitativeActivities: [] as RehabilitativeActivity[],
      schedule: {
        duration: 2,
      },
      consecutiveChargeNumber: '99',
      consecutiveReportAvailable: true,
    },
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPossibleConsecutivePunishments.mockResolvedValue(consecutivePunishments)
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
      .get(adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(`${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start('100')}?punishmentType=ADDITIONAL_DAYS`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Which punishment will it be consecutive to?')
      })
  })
  it('should call the endpoint to get consecutive punishments', () => {
    return request(app)
      .get(`${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start('100')}?punishmentType=ADDITIONAL_DAYS`)
      .expect('Content-Type', /html/)
      .then(() =>
        expect(punishmentsService.getPossibleConsecutivePunishments).toHaveBeenCalledWith(
          '100',
          PunishmentType.ADDITIONAL_DAYS,
          expect.anything()
        )
      )
  })
})

describe('POST', () => {
  it('should add punishment to session with consecutive punishment report number present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&duration=5`
      )
      .send({
        select: 'consecutive-report-101',
      })
      .then(() => {
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.ADDITIONAL_DAYS,
            duration: 5,
            consecutiveChargeNumber: '101',
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
            rehabilitativeActivities: [],
          },
          '100'
        )
      })
  })
})
